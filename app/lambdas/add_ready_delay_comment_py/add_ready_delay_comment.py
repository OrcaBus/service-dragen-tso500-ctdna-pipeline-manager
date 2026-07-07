#!/usr/bin/env python3

"""
Generate a workflow run comment when the readyEventToIcav2WesRequestEvent state machine starts.

Informs the user that the workflow run is transitioning from READY to SUBMITTED,
and includes the decompression delay warning since dragen-tso500-ctdna uses FASTQ
inputs that require ORA-to-FASTQ decompression.
"""

# Standard imports
from os import environ
from typing import Dict, Any

# Layer imports
from orcabus_api_tools.workflow import (
    add_comment_to_workflow_run,
    get_workflow_run_from_portal_run_id
)

# Globals
WORKFLOW_NAME_ENV_VAR = "WORKFLOW_NAME"
COMMENT_AUTHOR = "{workflow_name}-ready-to-icav2-wes-service"
MAX_COMMENT_LENGTH = 1024
TRUNCATION_SUFFIX = "\n... [truncated, see execution ARN for full detail]"


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    Add a comment to the workflow run indicating the READY-to-SUBMITTED transition has started.

    Includes a decompression delay warning since this pipeline uses FASTQ inputs that
    require ORA-to-FASTQ decompression before submission.

    Event shape:
    {
        "portalRunId": "<portal-run-id>",
        "executionArn": "<step-functions-execution-arn>"
    }

    Returns:
    {
        "status": "comment_added",
        "workflowRunId": "<orcabus-id>"
    }
    """
    portal_run_id = event.get("portalRunId")
    execution_arn = event.get("executionArn", "")

    # Ensure portal run id is provided
    if portal_run_id is None:
        raise ValueError("portalRunId must be provided in the event")

    # Get the workflow run id from the portal run id
    workflow_run_id = get_workflow_run_from_portal_run_id(portal_run_id)["orcabusId"]

    workflow_name = environ.get(WORKFLOW_NAME_ENV_VAR, "unknown")
    author = COMMENT_AUTHOR.format(workflow_name=workflow_name)

    # Build comment body with decompression delay note
    body = (
        "Submitting workflow run to ICAv2 — transitioning from READY to SUBMITTED.\n"
        "Note: There may be a delay between READY and SUBMITTED due to ORA-to-FASTQ decompression time."
    )

    footer = f"---\nStep Functions Execution: {execution_arn}"
    full_comment = f"{body}\n{footer}"

    # Enforce 1024 char limit
    if len(full_comment) > MAX_COMMENT_LENGTH:
        available = MAX_COMMENT_LENGTH - len(footer) - len(TRUNCATION_SUFFIX) - 1
        full_comment = f"{body[:available]}{TRUNCATION_SUFFIX}\n{footer}"

    add_comment_to_workflow_run(
        workflow_run_orcabus_id=workflow_run_id,
        comment=full_comment,
        author=author,
    )

    return {
        "status": "comment_added",
        "workflowRunId": workflow_run_id
    }
