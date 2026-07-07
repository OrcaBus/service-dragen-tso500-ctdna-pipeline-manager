#!/usr/bin/env python3

"""
The input upload stage has failed, we add a comment to the workflow run.
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
COMMENT_AUTHOR = "{WORKFLOW_NAME}-ready-to-icav2-wes-service"
MAX_COMMENT_LENGTH = 1024
TRUNCATION_SUFFIX = "\n... [truncated, see execution ARN for full detail]"


def handler(event, context):
    """
    Add a comment to the workflow run indicating an upload failure.

    Event shape:
    {
        "errorType": "<error-type>",
        "portalRunId": "<portal-run-id>",
        "executionArn": "<step-functions-execution-arn>"
    }
    """
    # Collect inputs
    error_type = event.get("errorType")
    portal_run_id = event.get("portalRunId")
    execution_arn = event.get("executionArn", "")

    # Ensure error type is provided
    if error_type is None:
        raise ValueError("errorType must be provided in the event")

    # Ensure portal run id is provided
    if portal_run_id is None:
        raise ValueError("portalRunId must be provided in the event")

    # Get the workflow run id from the portal run id
    workflow_run_id = get_workflow_run_from_portal_run_id(portal_run_id)["orcabusId"]

    # Construct the comment body
    body = f"The workflow has failed at the upload inputs stage with error type '{error_type}'."
    footer = f"---\nStep Functions Execution: {execution_arn}"
    full_comment = f"{body}\n{footer}"

    # Enforce 1024 char limit
    if len(full_comment) > MAX_COMMENT_LENGTH:
        available = MAX_COMMENT_LENGTH - len(footer) - len(TRUNCATION_SUFFIX) - 1
        full_comment = f"{body[:available]}{TRUNCATION_SUFFIX}\n{footer}"

    # Construct the comment
    add_comment_to_workflow_run(
        workflow_run_orcabus_id=workflow_run_id,
        comment=full_comment,
        author=COMMENT_AUTHOR.format(
            WORKFLOW_NAME=environ.get(WORKFLOW_NAME_ENV_VAR)
        )
    )

    return {
        "status": "comment_added",
        "workflowRunId": workflow_run_id
    }
