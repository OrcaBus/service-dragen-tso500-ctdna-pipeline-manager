#!/usr/bin/env python3

"""
Add a comment to indicate that we need to first decompress the fastq data and
generate a samplesheet before we can submit an ICAv2 WES event
"""

# Standard imports
from textwrap import dedent
from os import environ

# Layer imports
from orcabus_api_tools.workflow import (
    add_comment_to_workflow_run,
    get_workflow_run_from_portal_run_id
)

# Globals
WORKFLOW_NAME_ENV_VAR = "WORKFLOW_NAME"
COMMENT_AUTHOR = "{WORKFLOW_NAME}-workflow-orchestration-service"

MESSAGE = dedent(
    """
    Before we can submit an ICAv2 WES event, we need to first decompress the fastq data
    from ORA to GZIP format and generate a TSO500 ctDNA appropriate SampleSheet.
    This may take some time depending on the size of the input data.
    """
).strip()


def handler(event, context):
    """
    Add a comment to indicate that we need to first decompress the fastq data and
    generate a samplesheet before we can submit an ICAv2 WES event
    """

    # Get inputs
    portal_run_id = event.get("portalRunId")

    # Ensure portal run id is provided
    if portal_run_id is None:
        raise ValueError("portalRunId must be provided in the event")

    # Get the workflow run id from the portal run id
    workflow_run_id = get_workflow_run_from_portal_run_id(portal_run_id)["orcabusId"]

    # Add the comment
    add_comment_to_workflow_run(
        workflow_run_orcabus_id=workflow_run_id,
        comment=MESSAGE,
        author=COMMENT_AUTHOR.format(
            WORKFLOW_NAME=environ.get(WORKFLOW_NAME_ENV_VAR)
        )
    )

    return {
        "status": "comment_added",
        "workflowRunId": workflow_run_id
    }
