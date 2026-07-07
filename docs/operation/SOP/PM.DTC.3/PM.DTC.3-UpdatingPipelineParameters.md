# Updating Pipeline Parameters

- Version: 1.0
- Contact: Alexis Lucattini, [alexisl@unimelb.edu.au](mailto:alexisl@unimelb.edu.au)

From time-to-time there may be a requirement to add or update pipeline parameters for the Dragen TSO500 ctDNA pipeline.

- [Constants File Update](#constants-file-update)
- [Draft Event Schema](#draft-event-schema)
- [Lambda Parameter Mapping](#lambda-parameter-mapping)
- [Testing](#testing)

## Constants File Update

To update any of our pipeline parameters, head to the [infrastructure constants path][infrastructure_constants_path] and
update the relevant constant values.

Parameters that may need updating include:

- `WORKFLOW_VERSION_TO_DEFAULT_ICAV2_PIPELINE_ID_MAP` — pipeline IDs by workflow version
- Default input parameters for ICAv2 submission
- SSM parameter paths for environment-specific configuration

## Draft Event Schema

If you are adding or removing parameters, you may need to update the [DRAFT event schema][draft_event_schema] to reflect these changes.
This ensures that the input validation for the DRAFT payload is accurate and up-to-date.

## Lambda Parameter Mapping

If you are adding or removing parameters, you will need to update the mapping logic in the ready-to-ICAv2-WES-request Lambda to ensure that the
DRAFT payload inputs are correctly mapped to the ICAv2 pipeline parameters.

## Testing

Deploy your changes to development first.

As a first pass, you may wish to follow the [Manual Pipeline Execution SOP][manual_pipeline_execution_sop] to ensure
that the changes you have made are functioning as expected.

Once you are happy with the changes, you can trigger a full run through the [Pipeline Verification SOP][verification_testing_sop] to ensure that everything is working as expected.

[draft_event_schema]: ../../../../app/schemas/complete-data-draft-schema.json
[manual_pipeline_execution_sop]: ../PM.DTC.1/PM.DTC.1-ManualPipelineExecution.md
[verification_testing_sop]: ../PM.DTC.4/PM.DTC.4-RunningWorkflowValidations.md
[infrastructure_constants_path]: ../../../../infrastructure/stage/constants.ts
