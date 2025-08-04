Service Dragen TSO500 ctDNA Pipeline Manager
================================================================================

- [Template Service](#template-service)
  - [Service Description](#service-description)
    - [Name \& responsibility](#name--responsibility)
    - [Description](#description)
    - [API Endpoints](#api-endpoints)
    - [Consumed Events](#consumed-events)
    - [Published Events](#published-events)
    - [(Internal) Data states \& persistence model](#internal-data-states--persistence-model)
    - [Major Business Rules](#major-business-rules)
    - [Permissions \& Access Control](#permissions--access-control)
    - [Change Management](#change-management)
      - [Versioning strategy](#versioning-strategy)
      - [Release management](#release-management)
  - [Infrastructure \& Deployment](#infrastructure--deployment)
    - [Stateful](#stateful)
    - [Stateless](#stateless)
    - [CDK Commands](#cdk-commands)
    - [Stacks](#stacks)
  - [Development](#development)
    - [Project Structure](#project-structure)
    - [Setup](#setup)
      - [Requirements](#requirements)
      - [Install Dependencies](#install-dependencies)
      - [First Steps](#first-steps)
    - [Conventions](#conventions)
    - [Linting \& Formatting](#linting--formatting)
    - [Testing](#testing)
  - [Glossary \& References](#glossary--references)


Description
--------------------------------------------------------------------------------

### Summary

This is the Dragen TSO500 ctDNA Pipeline Management service, responsible for shuffling inputs as required,
to fit the pipeline requirements, and to manage the state of the pipeline execution.

The Illumina pipeline itself runs on ICAv2 through the nextflow engine.

### Events Overview

We listen to READY WRSC events were the workflow name is equal to 'dragen-tso500-ctdna-pipeline'.

We parse this to the ICAv2 WES service to generate an ICAv2 WES workflow request.

We then parse ICAv2 Analysis State Change events to update the state of the workflow in our service.

Because the Illumina pipeline is designed to run from BCLs not Fastqs, we need to structure the inputs as if they have
just been demultiplexed. This means generating a SampleSheet inside an instrument run directory, and then adding fastq files to the same directory.
The pipeline does not support ORA compressed fastqs, so we also need to decompress them first into this directory.

![events-overview](docs/drawio-exports/dragen-tso500-ctdna.drawio.svg)

### Consumed Events

| Name / DetailType             | Source                    | Schema Link     | Description                           |
|-------------------------------|---------------------------|-----------------|---------------------------------------|
| `WorkflowRunStateChange`      | `orcabus.workflowmanager` | <schema link>   | DRAFT state change                    |
| `WorkflowRunStateChange`      | `orcabus.workflowmanager` | <schema link>   | READY state change                    |
| `Icav2WesAnalysisStateChange` | `orcabus.icav2wes`        | <schema link>   | ICAv2 WES Analysis State Change event |

### Published Events

| Name / DetailType        | Source                      | Schema Link     | Description                     |
|--------------------------|-----------------------------|-----------------|---------------------------------|
| `WorkflowRunStateChange` | `orcabus.dragentso500ctdna` | <schema link>   | Workflow Run State Change event |


### Draft Event Example

**Full Draft Example:**

<details>

<summary>Click to expand</summary>

```json5
{
  "EventBusName": "OrcaBusMain",
  "Source": "orcabus.manual",
  "DetailType": "WorkflowRunStateChange",
  "Detail": {
    // status - Required - and must be set to DRAFT
    "status": "DRAFT",
    // timestamp - Required - set in UTC / ZULU time
    "timestamp": "2025-06-20T04:39:31Z",
    // workflowName - Required - Must be set to dragen-tso500-ctdna
    "workflowName": "dragen-tso500-ctdna",
    // workflowVersion - Required - Must be set to 2.6.1
    "workflowVersion": "2.6.1",
    // workflowRunName - Required - Nomenclature is umccr--automated--dragen-tso500-ctdna--<workflowVersion>--<portalRunId>
    "workflowRunName": "umccr--automated--dragen-tso500-ctdna--2-6-1--20250620abcd6789",
    // portalRunId - Required - Must be set to a unique identifier for the run in the format YYYYMMDD<8-hex-digit-unique-id>
    "portalRunId": "20250620abcd6789",  // pragma: allowlist secret
    // linkedLibraries - Required - List of linked libraries, in the format
    // 'libraryId': '<libraryId>', 'orcabusId': '<orcabusId>'
    "linkedLibraries": [
      {
        "libraryId": "L2301197",
        "orcabusId": "lib.01JBMVHM2D5GCC7FTC20K4FDFK"
      }
    ],
    // payload - The payload for the workflow run, containing all the necessary data
    "payload": {
      // version - The version of the payload schema used by this service
      // Not currently used by the service, but may be used in future
      "version": "2025.06.20",
      // data - The data for the workflow run, containing inputs, engine parameters, and tags
      "data": {
        // all inputs for the dragen-tso-ctdna pipeline
        "inputs": {
          // Input options are very limited for this pipeline, as it is designed to run from BCLs
          // We generate the samplesheet internally, and expect the rgid to be in <index>.<lane>.<instrument_run_id> format
          // To ensure that we properly generate the samplesheet
          // Currently we only support fastq list rows that are on the same instrument run id
          "fastqListRows": [
            {
              "rgid": "AAAAAAA+GGGGGGGG.4.240902_A01030_0366_ABCD1234567",
              "rglb": "L2301197",
              "rgsm": "L2301197",
              "lane": 1,
              "read1FileUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/test_data/ora-testing/input_data/MDX230428_L2301197_S7_L004_R1_001.fastq.ora",
              "read2FileUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/test_data/ora-testing/input_data/MDX230428_L2301197_S7_L004_R2_001.fastq.ora"
            }
          ],
          // The library id
          "sampleName": "L2301197"
        },
        // engineParameters - Parameters for the pipeline engine
        "engineParameters": {
          // Not required, defaults to the default pipeline for the workflowVersion specified
          "pipelineId": "5009335a-8425-48a8-83c4-17c54607b44a",
          // Not required, defaults to the default project id
          "projectId": "ea19a3f5-ec7c-4940-a474-c31cd91dbad4",
          // Not required, defaults to the default workflow output prefix
          "outputUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/analysis/dragen-tso500-ctdna/20250620abcd6789/",
          // Not required, defaults to the default workflow logs prefix
          "logsUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/logs/dragen-tso500-ctdna/20250620abcd6789/",
          // Not required, defaults to the default workflow cache prefix
          "cacheUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/cache/dragen-tso500-ctdna/20250620abcd6789/",
        },
        "tags": {
          // libraryId, required, the germline library ID for the workflow run
          "libraryId": "L2301197",
          // fastqRgidList, not required, a list of fastq RGIDs for the workflow run
          // If not provided, will be populated from the fastq manager for the current fastq set for the library id provided
          "fastqRgidList": [
            "AAAAAAA+GGGGGGGG.4.240902_A01030_0366_ABCD1234567"
          ],
          // subjectId, not required, the subject ID for the workflow run
          // If not provided, will be populated by the metadata manager from the libraryId provided
          "subjectId": "ExternalSubjectId",
          // individualId - not required, the individual ID for the workflow run
          "individualId": "InternalSubjectId",
        }
      }
    }
  }
}
```

</details>

**Minimal Draft Example:**

```json5
{
  "EventBusName": "OrcaBusMain",
  "Source": "orcabus.manual",
  "DetailType": "WorkflowRunStateChange",
  "Detail": {
    // status - Required - and must be set to DRAFT
    "status": "DRAFT",
    // timestamp - Required - set in UTC / ZULU time
    "timestamp": "2025-06-20T04:39:31Z",
    // workflowName - Required - Must be set to dragen-tso500-ctdna
    "workflowName": "dragen-tso500-ctdna",
    // workflowVersion - Required - Must be set to 2.6.1
    "workflowVersion": "2.6.1",
    // workflowRunName - Required - Nomenclature is umccr--automated--dragen-tso500-ctdna--<workflowVersion>--<portalRunId>
    "workflowRunName": "umccr--automated--dragen-tso500-ctdna--2-6-1--20250620abcd6789",
    // portalRunId - Required - Must be set to a unique identifier for the run in the format YYYYMMDD<8-hex-digit-unique-id>
    "portalRunId": "20250620abcd6789",  // pragma: allowlist secret
    // linkedLibraries - Required - List of linked libraries, in the format
    // 'libraryId': '<libraryId>', 'orcabusId': '<orcabusId>'
    "linkedLibraries": [
      {
        "libraryId": "L2301197",
        "orcabusId": "lib.01JBMVHM2D5GCC7FTC20K4FDFK"
      }
    ]
  }
}
```

### Make your own minimal draft event with bash + Jq

```bash
# Globals
EVENT_BUS_NAME="OrcaBusMain"
DETAIL_TYPE="WorkflowRunStateChange"
SOURCE="orcabus.manual"

WORKFLOW_NAME="dragen-tso500-ctdna"
WORKFLOW_VERSION="2.6.0"

PAYLOAD_VERSION="2025.07.29"

# Glocals
LIBRARY_ID="L2401531"

# Functions
get_hostname_from_ssm(){
  aws ssm get-parameter \
    --name "/hosted_zone/umccr/name" \
    --output json | \
  jq --raw-output \
    '.Parameter.Value'
}

get_orcabus_token(){
  aws secretsmanager get-secret-value \
    --secret-id orcabus/token-service-jwt \
    --output json \
    --query SecretString | \
  jq --raw-output \
    'fromjson | .id_token'
}

get_library_obj_from_library_id(){
  local library_id="$1"
  curl --silent --fail --show-error --location \
    --header "Authorization: Bearer $(get_orcabus_token)" \
    --url "https://metadata.$(get_hostname_from_ssm)/api/v1/library?libraryId=${library_id}" | \
  jq --raw-output \
    '
      .results[0] |
      {
        "libraryId": .libraryId,
        "orcabusId": .orcabusId
      }
    '
}

generate_portal_run_id(){
  echo "$(date -u +'%Y%m%d')$(openssl rand -hex 4)"
}

get_libraries(){
  local library_id="$1"

  library_obj=$(get_library_obj_from_library_id "$library_id")

  jq --null-input --raw-output \
    --argjson libraryObj "$library_obj" \
    '
      [
          $libraryObj
      ]
    '
}

# Generate the event
event_cli_json="$( \
  jq --null-input --raw-output \
    --arg eventBusName "$EVENT_BUS_NAME" \
    --arg detailType "$DETAIL_TYPE" \
    --arg source "$SOURCE" \
    --arg workflowName "$WORKFLOW_NAME" \
    --arg workflowVersion "${WORKFLOW_VERSION}" \
    --arg payloadVersion "$PAYLOAD_VERSION" \
    --arg portalRunId "$(generate_portal_run_id)" \
    --argjson libraries "$(get_libraries "$LIBRARY_ID")" \
    '
      {
        # Standard fields for the event
        "EventBusName": $eventBusName,
        "DetailType": $detailType,
        "Source": $source,
        # Detail must be a JSON object in string format
        "Detail": (
          {
            "status": "DRAFT",
            "timestamp": (now | todateiso8601),
            "workflow": {
                "name": $workflowName,
                "version": $workflowVersion,
            },
            "workflowRunName": ("umccr--automated--" + $workflowName + "--" + ($workflowVersion | gsub("\\."; "-")) + "--" + $portalRunId),
            "portalRunId": $portalRunId,
            "libraries": $libraries
          } |
          tojson
        )
      } |
      # Now wrap into an "entry" for the CLI
      {
        "Entries": [
          .
        ]
      }
    ' \
)"

echo aws events put-events --no-cli-pager --cli-input-json "${event_cli_json}"
```

Infrastructure & Deployment
--------------------------------------------------------------------------------

Infrastructure and deployment are managed via CDK. This template provides two types of CDK entry points: `cdk-stateless` and `cdk-stateful`.


### Stateful Stack

The stateful stack for this service includes the following resources:

These parameters are used to help generate READY Events for the Dragen WGTS DNA pipeline from DRAFT events.

SSM Parameters List

* workflowName: The name of the workflow managed by this service (dragen-wgts-dna)
* workflowVersion: The workflow version 4.4.4
* prefixPipelineIdsByWorkflowVersion: SSM Parameter root path mapping workflow versions to default ICAv2 pipeline IDs
* icav2ProjectId: The default ICAv2 project ID for this service (development for dev, production for prod)
* payloadVersion: The version of the payload schema used by this service (NA)
* logsPrefix: The default prefix for logs generated by this service
* outputPrefix: The default prefix for outputs generated by this service
* cachePrefix: The default prefix for cache generated by this service


### Stateless

#### StepFunctions

**Dragen TSO500 ctDNA Draft to Ready State Machine**

![draft-to-ready-sfn](docs/workflow-studio-exports/dragen-tso500-ctdna-draft-to-ready.svg)

**Dragen TSO500 ctDNA Ready to ICAv2 WES Submitted State Machine**

![ready-to-icav2-submitted-sfn](docs/workflow-studio-exports/dragen-tso500-ctdna-ready-to-icav2-wes-submitted.svg)

**ICAv2 WES Event to WRSC Event State Machine**

![icav2-analysis-sc-to-wrsc](docs/workflow-studio-exports/dragen-tso500-ctdna-icav2-analysis-state-change-to-wrsc-event.svg)

### CDK Commands :construction:

You can access CDK commands using the `pnpm` wrapper script.

- **`cdk-stateless`**: Used to deploy stacks containing stateless resources (e.g., AWS Lambda), which can be easily redeployed without side effects.
- **`cdk-stateful`**: Used to deploy stacks containing stateful resources (e.g., AWS DynamoDB, AWS RDS), where redeployment may not be ideal due to potential side effects.

The type of stack to deploy is determined by the context set in the `./bin/deploy.ts` file. This ensures the correct stack is executed based on the provided context.

For example:

```sh
# Deploy a stateless stack
pnpm cdk-stateless <command>

# Deploy a stateful stack
pnpm cdk-stateful <command>
```

### Stacks :construction:

This CDK project manages multiple stacks. The root stack (the only one that does not include `DeploymentPipeline` in its stack ID) is deployed in the toolchain account and sets up a CodePipeline for cross-environment deployments to `beta`, `gamma`, and `prod`.

To list all available stacks, run:

```sh
pnpm cdk-stateless ls
```

Example output:

```sh
OrcaBusStatelessServiceStack
OrcaBusStatelessServiceStack/DeploymentPipeline/OrcaBusBeta/DeployStack (OrcaBusBeta-DeployStack)
OrcaBusStatelessServiceStack/DeploymentPipeline/OrcaBusGamma/DeployStack (OrcaBusGamma-DeployStack)
OrcaBusStatelessServiceStack/DeploymentPipeline/OrcaBusProd/DeployStack (OrcaBusProd-DeployStack)
```


Development :construction:
--------------------------------------------------------------------------------

### Project Structure

The root of the project is an AWS CDK project where the main application logic lives inside the `./app` folder.

The project is organized into the following key directories:

- **`./app`**: Contains the main application logic. You can open the code editor directly in this folder, and the application should run independently.

- **`./bin/deploy.ts`**: Serves as the entry point of the application. It initializes two root stacks: `stateless` and `stateful`. You can remove one of these if your service does not require it.

- **`./infrastructure`**: Contains the infrastructure code for the project:
  - **`./infrastructure/toolchain`**: Includes stacks for the stateless and stateful resources deployed in the toolchain account. These stacks primarily set up the CodePipeline for cross-environment deployments.
  - **`./infrastructure/stage`**: Defines the stage stacks for different environments:
    - **`./infrastructure/stage/config.ts`**: Contains environment-specific configuration files (e.g., `beta`, `gamma`, `prod`).
    - **`./infrastructure/stage/stack.ts`**: The CDK stack entry point for provisioning resources required by the application in `./app`.

- **`.github/workflows/pr-tests.yml`**: Configures GitHub Actions to run tests for `make check` (linting and code style), tests defined in `./test`, and `make test` for the `./app` directory. Modify this file as needed to ensure the tests are properly configured for your environment.

- **`./test`**: Contains tests for CDK code compliance against `cdk-nag`. You should modify these test files to match the resources defined in the `./infrastructure` folder.


### Setup

#### Requirements

```sh
node --version
v22.9.0

# Update Corepack (if necessary, as per pnpm documentation)
npm install --global corepack@latest

# Enable Corepack to use pnpm
corepack enable pnpm

```

#### Install Dependencies

To install all required dependencies, run:

```sh
make install
```

#### First Steps

Before using this template, search for all instances of `TODO:` comments in the codebase and update them as appropriate for your service. This includes replacing placeholder values (such as stack names).


### Conventions

### Linting & Formatting

Automated checks are enforces via pre-commit hooks, ensuring only checked code is committed. For details consult the `.pre-commit-config.yaml` file.

Manual, on-demand checking is also available via `make` targets (see below). For details consult the `Makefile` in the root of the project.


To run linting and formatting checks on the root project, use:

```sh
make check
```

To automatically fix issues with ESLint and Prettier, run:

```sh
make fix
```

### Testing


Unit tests are available for most of the business logic. Test code is hosted alongside business in `/tests/` directories.

```sh
make test
```

Glossary & References
--------------------------------------------------------------------------------

For general terms and expressions used across OrcaBus services, please see the platform [documentation](https://github.com/OrcaBus/wiki/blob/main/orcabus-platform/README.md#glossary--references).

Service specific terms:

| Term      | Description                                      |
|-----------|--------------------------------------------------|
| Foo | ... |
| Bar | ... |
