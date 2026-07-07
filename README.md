# Dragen TSO500 ctDNA Pipeline Manager

- [Overview](#overview)
- [Pipeline State Flow](#pipeline-state-flow)
  - [1. DRAFT → populated DRAFT](#1-draft--populated-draft)
  - [2. Populated DRAFT → READY](#2-populated-draft--ready)
  - [3. READY → ICAv2 submission](#3-ready--icav2-submission)
  - [4. ICAv2 state changes → WorkflowRunUpdate events](#4-icav2-state-changes--workflowrunupdate-events)
- [Event Contract](#event-contract)
  - [Consumed Events](#consumed-events)
  - [Published Events](#published-events)
- [Draft Event Payload](#draft-event-payload)
  - [Minimal DRAFT event detail](#minimal-draft-event-detail)
  - [Auto-populated Fields](#auto-populated-fields)
  - [Schema Validation](#schema-validation)
- [Submitting a Draft Event](#submitting-a-draft-event)
- [Infrastructure](#infrastructure)
  - [Stateful Resources](#stateful-resources)
  - [Stateless Resources](#stateless-resources)
  - [Stacks](#stacks)
- [CI/CD and Release Management](#cicd-and-release-management)
- [Related Services](#related-services)
- [SOPs](#sops)
- [Glossary & References](#glossary--references)

---

## Overview

This service manages the lifecycle of the **Dragen TSO500 ctDNA pipeline** — Illumina's DRAGEN-based targeted sequencing pipeline for circulating tumour DNA (ctDNA) analysis using the TSO500 panel on ICAv2.

The pipeline runs on [ICAv2](https://help.connected.illumina.com/tso500/dragen-tso-500-ctdna-guides/dragen-tso-500-ctdna-v2.6) via Nextflow. Orchestration follows the standard [ICAv2-centric Pipeline Architecture](https://github.com/OrcaBus/wiki/blob/main/orcabus/platform/pipelines.md#pipeline-orchestration-general-logic).

This is a non-downstream (top-level) service — it has no upstream pipeline dependencies and is triggered directly by analysis events.

**Upstream**: None (triggered by [Analysis Glue](https://github.com/OrcaBus/service-analysis-glue))
**Downstream**: [PierianDx TSO500 ctDNA](https://github.com/OrcaBus/service-pieriandx-tso500-ctdna-pipeline-manager)

---

## Pipeline State Flow

The service orchestrates four Step Functions state machines that together drive a workflow run from initial DRAFT submission through to ICAv2 execution and result reporting.

### 1. DRAFT → populated DRAFT

**State machine**: [`populate_draft_data_sfn_template`](app/step-functions-templates/populate_draft_data_sfn_template.asl.json)

![Populate draft data](docs/draw-io-exports/populate-draft-data.svg)

When a `WorkflowRunStateChange` DRAFT event arrives, this state machine populates any missing payload fields by resolving defaults from SSM and querying upstream services:

1. **Resolve engine parameters** — `projectId`, `pipelineId`, `outputUri`, `logsUri`, `cacheUri` from SSM defaults
2. **Resolve tags** — library metadata, subject/individual IDs
3. **Emit DRAFT update** if tags or engine parameters changed
4. **Resolve inputs** — samplesheet generation, FASTQ data staging via Fastq Glue
5. Emits a final DRAFT update event with the fully populated payload

### 2. Populated DRAFT → READY

**State machine**: [`validate_draft_data_and_put_ready_event_sfn_template`](app/step-functions-templates/validate_draft_data_and_put_ready_event_sfn_template.asl.json)

![Validate draft and put READY event](docs/draw-io-exports/validate-draft-and-put-ready-event.svg)

Triggered when a DRAFT `WorkflowRunStateChange` event is received with a fully populated payload:

1. **Schema validation** — invokes `validate_draft_complete_schema` Lambda against the registered schema.
2. **Post-schema validation** — invokes `post_schema_validation` Lambda for business-rule checks. On failure, writes a comment to the 
3. **Push READY event** — emits a `WorkflowRunStateChange` READY event to the `OrcaBusMain` EventBridge bus.

### 3. READY → ICAv2 submission

**State machine**: [`ready_event_to_icav2_wes_request_event_sfn_template`](app/step-functions-templates/ready_event_to_icav2_wes_request_event_sfn_template.asl.json)

![READY to ICAv2 WES request](docs/draw-io-exports/ready-to-icav2-wes-request.svg)

Converts a READY event into an `Icav2WesRequest` event that the [ICAv2 WES Manager](https://github.com/OrcaBus/service-icav2-wes-manager) consumes to launch the analysis on ICAv2:

1. **Convert** — translates the READY event payload into the ICAv2 WES request format.
2. **Push** — emits an `Icav2WesRequest` event to `OrcaBusMain`.

### 4. ICAv2 state changes → WorkflowRunUpdate events

**State machine**: [`handle_icav2_analysis_state_change_event_sfn_template`](app/step-functions-templates/handle_icav2_analysis_state_change_event_sfn_template.asl.json)

![ICAv2 WES event to WRSC](docs/draw-io-exports/icav2-wes-event-to-wrsc.svg)

Listens for `Icav2WesAnalysisStateChange` events and converts them into `WorkflowRunUpdate` events:

1. **Convert** — maps the ICAv2 status to a `WorkflowRunStateChange` event.
2. **Route by status**:
   - **SUCCEEDED** — adds post-analysis tags, then pushes the WRSC event.
   - **FAILED** — writes a failure comment, then pushes the WRSC event.
   - **Any other status** — pushes the WRSC event directly.

---

## Event Contract

### Consumed Events

| DetailType                    | Source                    | Schema                                                                                                                                     | Description                                          |
|-------------------------------|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| `WorkflowRunStateChange`      | `orcabus.workflowmanager` | [WorkflowRunStateChange](https://github.com/OrcaBus/wiki/tree/main/orcabus-platform#workflowrunstatechange)                                | Carries DRAFT (and later READY) workflow run records |
| `Icav2WesAnalysisStateChange` | `orcabus.icav2wes`        | [Icav2WesAnalysisStateChange](https://github.com/OrcaBus/service-icav2-wes-manager/blob/main/app/event-schemas/analysis-state-change.json) | ICAv2 analysis state updates                         |

### Published Events

| DetailType          | Source                      | Schema                                                                                                      | Description                                         |
|---------------------|-----------------------------|-------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| `WorkflowRunUpdate` | `orcabus.dragentso500ctdna` | [WorkflowRunUpdate](https://github.com/OrcaBus/wiki/blob/main/orcabus/platform/events.md#workflowrunupdate) | Pipeline state updates (READY, running, succeeded…) |

---

## Draft Event Payload

A DRAFT event can be submitted with a minimal `data` payload — the populate state machine resolves all defaults. The `data` object may be omitted entirely. The final validated payload must satisfy the [complete-data draft schema](app/event-schemas/complete-data-draft/2025.07.29/complete-data-draft-schema.json).

### Minimal DRAFT event detail

```json
{
  "status": "DRAFT",
  "workflowName": "dragen-tso500-ctdna",
  "workflowVersion": "2.6.0",
  "workflowRunName": "umccr--automated--dragen-tso500-ctdna--2-6-0--<portalRunId>",
  "portalRunId": "<portalRunId>",
  "linkedLibraries": [
    { "libraryId": "L2400001", "orcabusId": "lib.01..." }
  ]
}
```

The `payload.data` object may be included to override any auto-populated fields. An empty or absent `payload.data` is valid.

### Auto-populated Fields

All of the following are resolved by the populate state machine if not explicitly provided:

| Field | Resolved from |
|---|---|
| `engineParameters.projectId` | SSM: default ICAv2 project for the environment |
| `engineParameters.pipelineId` | SSM: pipeline ID map keyed by workflow version |
| `engineParameters.outputUri` | SSM: output prefix + `portalRunId` |
| `engineParameters.logsUri` | SSM: logs prefix + `portalRunId` |
| `engineParameters.cacheUri` | SSM: cache prefix |
| `tags.libraryId` | From `linkedLibraries` |
| `tags.subjectId` / `individualId` | Metadata service |
| `inputs.samplesheet` | Generated from library metadata |
| `inputs.sequenceData` | Fastq Glue — FASTQ data for the library |

### Schema Validation

The complete-data schema is registered in the AWS Schemas registry and used for validation. You can interactively validate a payload at:

- [JSON Schema Validator — Complete DRAFT data](https://www.jsonschemavalidator.net/s/Tvaxl9os)

---

## Submitting a Draft Event

To manually submit a Dragen TSO500 ctDNA DRAFT event (e.g. to trigger a reanalysis), follow:

- [PM.DTC.1 — Manual Pipeline Execution](docs/operation/SOP/PM.DTC.1/PM.DTC.1-ManualPipelineExecution.md)

See the [full SOPs index](docs/operation/SOP/README.md) for all operational procedures including deployment, parameter updates, and troubleshooting.

---

## Infrastructure

The service is deployed via AWS CDK. Resources are split into two stacks: stateful (data/config) and stateless (compute/events).

All SSM parameters live under `/orcabus/workflows/dragen-tso500-ctdna/`.
Event bus: `OrcaBusMain`
Event source: `orcabus.dragentso500ctdna`

### Stateful Resources

**AWS Schemas registry**
- `dragen-tso500-ctdna-complete-data-draft-schema.json` — used to validate DRAFT payloads before promotion to READY

**SSM Parameters**

| Parameter | Description |
|---|---|
| `workflowName` | `dragen-tso500-ctdna` |
| `workflowVersion` | Current default version (e.g. `2.6.0`) |
| `payloadVersion` | Payload schema version |
| `icav2ProjectId` | Default ICAv2 project ID per environment |
| `logsPrefix` | Default S3 prefix for logs |
| `outputPrefix` | Default S3 prefix for outputs |
| `cachePrefix` | Default S3 prefix for cache |
| `pipelineIdsByWorkflowVersion/<version>` | ICAv2 pipeline ID for each workflow version |

### Stateless Resources

- **Lambda functions** (Python 3.14, ARM64) — one per task in the state machines; see [`app/lambdas/`](app/lambdas/)
- **ECS tasks** — tabix operations for VCF indexing; see [`app/ecs/`](app/ecs/)
- **Step Functions state machines** — four ASL templates in [`app/step-functions-templates/`](app/step-functions-templates/)
- **EventBridge rules** — route incoming `WorkflowRunStateChange` (DRAFT) and `Icav2WesAnalysisStateChange` events to the appropriate state machines

### Stacks

The CDK project deploys a CodePipeline in the toolchain account that promotes changes to `beta`, `gamma`, and `prod`.

```sh
# List stateful stacks
pnpm cdk-stateful ls
# StatefulDragenTso500CtdnaPipeline
# StatefulDragenTso500CtdnaPipeline/.../OrcaBusBeta/StatefulDragenTso500Ctdna
# StatefulDragenTso500CtdnaPipeline/.../OrcaBusGamma/StatefulDragenTso500Ctdna
# StatefulDragenTso500CtdnaPipeline/.../OrcaBusProd/StatefulDragenTso500Ctdna

# List stateless stacks
pnpm cdk-stateless ls
# StatelessDragenTso500CtdnaPipeline
# StatelessDragenTso500CtdnaPipeline/.../OrcaBusBeta/StatelessDragenTso500Ctdna
# StatelessDragenTso500CtdnaPipeline/.../OrcaBusGamma/StatelessDragenTso500Ctdna
# StatelessDragenTso500CtdnaPipeline/.../OrcaBusProd/StatelessDragenTso500Ctdna
```

---

## CI/CD and Release Management

All changes merged to `main` are automatically built and deployed to `beta` and `gamma`. Promotion to `prod` requires manually enabling the CodePipeline transition in the AWS console.

---

## Related Services

| Role            | Service                                                                                                     |
|-----------------|-------------------------------------------------------------------------------------------------------------|
| Upstream        | [Analysis Glue](https://github.com/OrcaBus/service-analysis-glue)                                           |
| Downstream      | [PierianDx TSO500 ctDNA](https://github.com/OrcaBus/service-pieriandx-tso500-ctdna-pipeline-manager)        |
| ICAv2 execution | [ICAv2 WES Manager](https://github.com/OrcaBus/service-icav2-wes-manager)                                   |
| Workflow state  | [Workflow Manager](https://github.com/OrcaBus/service-workflow-manager)                                     |
| Fastq           | [Fastq Glue](https://github.com/OrcaBus/service-fastq-glue)                                                 |

---

## SOPs

| SOP | Description |
|---|---|
| [PM.DTC.1](docs/operation/SOP/PM.DTC.1/PM.DTC.1-ManualPipelineExecution.md) | Manually kick off a reanalysis |
| [PM.DTC.2](docs/operation/SOP/PM.DTC.2/PM.DTC.2-NewPipelineDeployment.md) | Install and deploy a new pipeline version |
| [PM.DTC.3](docs/operation/SOP/PM.DTC.3/PM.DTC.3-UpdatingPipelineParameters.md) | Update SSM parameters |
| [PM.DTC.4](docs/operation/SOP/PM.DTC.4/PM.DTC.4-RunningWorkflowValidations.md) | Run workflow validations |
| [PM.DTC.5](docs/operation/SOP/PM.DTC.5/PM.DTC.5-TroubleShooting.md) | Troubleshoot common issues |

---

## Glossary & References

- Platform glossary: [OrcaBus wiki](https://github.com/OrcaBus/wiki/blob/main/orcabus-platform/README.md#glossary--references)
- For development setup, build commands, project structure, and conventions see the [steering docs](.kiro/steering/).
