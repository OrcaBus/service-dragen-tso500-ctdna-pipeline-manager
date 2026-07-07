# Troubleshooting

- Version: 1.0
- Contact: Alexis Lucattini, [alexisl@unimelb.edu.au](mailto:alexisl@unimelb.edu.au)

Most processes within the Dragen TSO500 ctDNA orchestration use AWS Step Functions to manage the workflow.
We post all Step Function errors to the #alerts-prod slack channel; a team member can
then click on the offending Step Function link in the slack message to be taken to the AWS Step Functions console to investigate further.

- [Analysis Stuck in DRAFT state](#analysis-stuck-in-draft-state)
  - [Fastq Sync Stuck](#fastq-sync-stuck)
  - [Payload Mismatch](#payload-mismatch)
- [Analysis Stuck in READY state](#analysis-stuck-in-ready-state)
- [Analysis Fails to Start](#analysis-fails-to-start)
  - [Project Not Set Up Correctly](#project-not-set-up-correctly)
  - [Invalid Pipeline ID](#invalid-pipeline-id)
  - [Data Not Available](#data-not-available)
- [Common Pipeline Failures](#common-pipeline-failures)

## Analysis Stuck in DRAFT state

If the analysis is stuck in DRAFT mode, there may be a couple of reasons for this.
Head to the [AWS Step Functions Console][aws_step_functions_console_prod] in the production account and look for any
RUNNING executions in the `orca-dragen-tso500-ctdna--populateDraftData` step function.

If there is a RUNNING execution for this library ID, the issue is likely due to the Step Functions hanging at the Fastq Sync step.
See the Fastq Sync stuck section below for more information.

If there is no RUNNING execution for this library ID, the issue is likely due to a payload being incomplete.
See the Payload Mismatch section below.

### Fastq Sync Stuck

The Fastq Sync step may hang for a number of hours. Reasons may include:

- Fastq QC stat jobs are taking a long time to complete (usually no longer than one hour)
- Fastq data is still being sequenced and is not yet available for processing (depends on sequencing run, usually up to 48 hours)
- Fastq data is being thawed from archive storage (S3 Glacier) (usually around 8 to 10 hours)

The failed execution will push a message to the #alerts-prod slack channel.
You may wish to then 'redrive' the execution from the console.

### Payload Mismatch

If you can find the most recent step function execution for this library ID, look at the Log Group for the
`validate_draft_complete_schema` lambda to see how the payload violates the expected schema.

You may wish to then manually update the payload and generate a new WorkflowRunUpdate draft event as discussed in [PM.DTC.1][sop_1_rel_path].

## Analysis Stuck in READY state

If the analysis is stuck in READY state, the translation from the READY event to the ICAv2 WES event may have failed.
This is a rare occurrence, but may be due to transient issues with the ICAv2 WES manager.

Confirm by querying the offending workflow run name against the [ICAv2 WES Manager API][icav2_wes_api_swagger_page].
If no analysis is found, the issue is likely a communication failure between this service and the ICAv2 WES Manager.

## Analysis Fails to Start

The ICAv2 WES manager may fail to create an analysis for any of the following reasons:

### Project Not Set Up Correctly

Common things to confirm:

- Ensure the ICAv2 Production Service User has been added to the project with correct permissions.
- Ensure the Notifications Channels have been set up correctly.

### Invalid Pipeline ID

> The pipeline id specified is not available in the project id

Confirm with:

```shell
icav2 projects enter <project_id>
icav2 pipelines get <pipeline_id>
```

### Fastq Decompression Service failing

Before going from READY to SUBMITTED state, the dragen-tso500-ctdna service needs to decompress ORA fastqs
into gzipped fastqs, since the current 2.6.X versions of the service do not support ORA fastqs.

### Data Not Available

> Data .x. is not available in the project id <project_id>

If data is available via the S3 External Data Access Route from the ICAv2 WES manager, the WES manager will
use this route to access the data. Otherwise, the data may need to be linked within ICAv2.

## Common Pipeline Failures

TSO500 ctDNA pipeline failures may include:

- **Insufficient samples in run** — the TSO500 pipeline requires a minimum number of samples per batch for certain QC steps.
- **Samplesheet format errors** — verify the samplesheet generation step produced valid output.
- **Resource exhaustion** — check ICAv2 project quotas and pipeline resource allocation.

For all failures, check the ICAv2 analysis logs and the Step Function execution history for detailed error messages.

[aws_step_functions_console_prod]: https://472057503814.ap-southeast-2.console.aws.amazon.com/states/home?region=ap-southeast-2#/statemachines
[sop_1_rel_path]: ../PM.DTC.1/PM.DTC.1-ManualPipelineExecution.md
[icav2_wes_api_swagger_page]: https://icav2-wes.prod.umccr.org/schema/swagger-ui#/
