# New Dragen TSO500 ctDNA Pipeline Deployment

- Version: 1.0
- Contact: Alexis Lucattini, [alexisl@unimelb.edu.au](mailto:alexisl@unimelb.edu.au)

There may be times where we need to deploy a new version of the Dragen TSO500 ctDNA pipeline onto the ICAv2 platform.

In the SOP below we discuss the following scenarios:

- User wants to test a new pipeline version in development.
- User wants to make a new release of the pipeline for production use.

Throughout the SOP we make the following expectations:

- User has access to the ICAv2 platform with at minimum 'Contributor level' permissions in at least one project.
- User has access to the appropriate AWS Account tied to the ICAv2 project.

* [Pipeline Summary](#pipeline-summary)
* [Development Deployment](#development-deployment)
  - [Pipeline Creation](#pipeline-creation)
  - [Running the Pipeline](#running-the-pipeline)
* [Production Deployment](#production-deployment)
  - [Infrastructure Constants Updates](#infrastructure-constants-updates)
  - [Workflow Manager Updates](#workflow-manager-updates)
  - [Analysis Glue Updates](#analysis-glue-updates)

## Pipeline Summary

The Dragen TSO500 ctDNA pipeline runs on [ICAv2][ica_about] using the Nextflow engine.
The pipeline performs targeted sequencing analysis for circulating tumour DNA using the TSO500 panel,
including variant calling, copy number analysis, and TMB/MSI detection.

The pipeline is developed and shared via Illumina using ICA's [Entitled bundles feature][entitled_bundles_feature] that auto-link into our ICA tenancy.
Entitled bundles are shared tenancy wide meaning bundles do not need to be linked into a project in order for the pipeline to run in that project.

## Development Deployment

### Pipeline ID discovery

The pipeline id can be discovered by

1. Selecting the bundle of interest under the [Entitled Bundles View][entitled_bundles_view]
2. Selecting the pipeline under to Flow → Pipelines → Pipeline of interest
3. Viewing the pipeline id under Details → General → ID

### Testing

Once the pipeline id discovered, we can then run it on a test dataset to ensure that it works as expected.
See [PM.DTC.1][sop_1_rel_path] for instructions on how to kick off the pipeline.

Note you will need to manually add in the following into the payload section of the WorkflowRunUpdate event:

```json5
{
  // ... Other top level items such as portal run id
  payload: {
    version: '<DEFAULT_PAYLOAD_VERSION>',
    data: {
      engineParameters: {
        pipelineId: '<THE PIPELINE ID YOU JUST DISCOVERED>',
      },
    },
  },
}
```

The workflow can then be monitored via the [OrcaBus Dev UI interface][orcabus_dev_ui_link].

## Production Deployment

### Infrastructure Constants Updates

Update the pipeline ID map in [infrastructure constants][infrastructure_constants_rel_path]:

```typescript
export const WORKFLOW_VERSION_TO_DEFAULT_ICAV2_PIPELINE_ID_MAP: Record<
  WorkflowVersionType,
  string
> = {
  '<SEMANTIC_VERSION_ID>': '<THE PIPELINE ID>',
};
```

Make a PR and get it reviewed and approved before merging into main.

### Workflow Manager Updates

Register the workflow with the Workflow Manager:

```shell
make-new-workflow.sh \
  --workflow-name 'dragen-tso500-ctdna' \
  --workflow-version "2.6.0" \
  --executionEngine "ICA" \
  --executionEnginePipelineId "<THE PIPELINE ID>" \
  --validationState "VALIDATED"
```

### Analysis Glue Updates

Head to the [analysis-glue repository][analysis_glue_repo_link] and update the constants to include the new workflow version.

[ica_about]: https://www.illumina.com/products/by-type/informatics-products/connected-analytics.html
[sop_1_rel_path]: ../PM.DTC.1/PM.DTC.1-ManualPipelineExecution.md
[orcabus_dev_ui_link]: https://orcaui.dev.umccr.org/
[analysis_glue_repo_link]: https://github.com/OrcaBus/service-analysis-glue
[infrastructure_constants_rel_path]: ../../../../infrastructure/stage/constants.ts
[entitled_bundles_feature]: https://help.ica.illumina.com/home/h-bundles#entitled-bundles
[entitled_bundles_view]: https://ica.illumina.com/ica/bundles?tabsheet-bundlesview=tab-bundlesview-entitledbundles
