#!/usr/bin/env python3

"""
The ICA analysis has failed, we add a comment to the analysis
"""

# Standard imports
from os import environ

# Local imports
from orcabus_api_tools.workflow import (
    add_comment_to_workflow_run,
    get_workflow_run_from_portal_run_id
)

# Globals
WORKFLOW_NAME_ENV_VAR = "WORKFLOW_NAME"
COMMENT_AUTHOR = "{WORKFLOW_NAME}-workflow-service"


def handler(event, context):
    """
    Add a comment to the ICA analysis indicating failure.

    """
    # Collect inputs
    error_type = event.get("errorType")
    steps_execution_arn = event.get("stepsExecutionId")
    portal_run_id = event.get("portalRunId")

    # Ensure error type is provided
    if error_type is None:
        raise ValueError("errorType must be provided in the event")

    # Ensure portal run id is provided
    if portal_run_id is None:
        raise ValueError("portalRunId must be provided in the event")

    # Get the workflow run id from the portal run id
    workflow_run_id = get_workflow_run_from_portal_run_id(portal_run_id)["orcabusId"]

    # If error message uri is not none, set comment to include message uri
    comment = (
        f"The workflow has failed at the upload inputs stage with error type '{error_type}', "
        f"The Steps Execution ID was as follows '{steps_execution_arn}'"
    )

    # Construct the comment
    add_comment_to_workflow_run(
        workflow_run_orcabus_id=workflow_run_id,
        comment=comment,
        author=COMMENT_AUTHOR.format(
            WORKFLOW_NAME=environ.get(WORKFLOW_NAME_ENV_VAR)
        )
    )

    return {
        "status": "comment_added",
        "workflowRunId": workflow_run_id
    }
