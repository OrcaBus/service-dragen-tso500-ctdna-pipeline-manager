# Running Workflow Validations

- Version: 1.0
- Contact: Alexis Lucattini, [alexisl@unimelb.edu.au](mailto:alexisl@unimelb.edu.au)

When deploying a new version of the Dragen TSO500 ctDNA pipeline, it is important to validate that the pipeline
produces expected results on known test datasets before promoting to production.

- [Prerequisites](#prerequisites)
- [Validation Process](#validation-process)
  - [1. Select Test Samples](#1-select-test-samples)
  - [2. Run Pipeline on Test Data](#2-run-pipeline-on-test-data)
  - [3. Compare Outputs](#3-compare-outputs)
  - [4. Sign-off](#4-sign-off)

## Prerequisites

- Access to the ICAv2 development/beta environment
- A known set of test samples with expected results
- The new pipeline version deployed in development (see [PM.DTC.2][new_pipeline_deployment_sop])

## Validation Process

### 1. Select Test Samples

Choose a representative set of samples that exercise the key features of the TSO500 ctDNA pipeline:

- Samples with known variants (SNVs, indels, CNVs)
- Samples with known TMB/MSI status
- Negative controls

### 2. Run Pipeline on Test Data

Follow [PM.DTC.1][manual_pipeline_execution_sop] to submit DRAFT events for each test sample,
specifying the new pipeline version in the `workflowVersion` field.

### 3. Compare Outputs

Compare the pipeline outputs against expected results:

- Variant concordance (sensitivity and specificity)
- TMB and MSI status
- Quality metrics within acceptable ranges

### 4. Sign-off

Once validation is complete and results are acceptable, proceed with production deployment
as described in [PM.DTC.2][new_pipeline_deployment_sop].

[manual_pipeline_execution_sop]: ../PM.DTC.1/PM.DTC.1-ManualPipelineExecution.md
[new_pipeline_deployment_sop]: ../PM.DTC.2/PM.DTC.2-NewPipelineDeployment.md
