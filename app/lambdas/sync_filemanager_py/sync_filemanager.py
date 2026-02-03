#!/usr/bin/env python3

"""
Validate that the filemanager is synchronized with ICAv2 for files downstream of the output URI.
This Lambda compares the number of files recorded in the filemanager for a given portalRunId
with the number of files present in ICAv2 under the corresponding project and folder.
It does not add or modify any tags; tagging is handled separately (e.g. by add_portal_run_id_attributes).
"""

# Standard imports
from urllib.parse import urlparse
import logging

# Wrapica imports
from wrapica.project_data import find_project_data_bulk, convert_uri_to_project_data_obj

# Layer imports
from icav2_tools import set_icav2_env_vars
from orcabus_api_tools.filemanager import list_files_from_portal_run_id

# Setup logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def handler(event, context):
    """
    Check synchronization status between filemanager and ICAv2 for a given output URI and portal run ID.

    Retrieves files from the filemanager tagged with the given portalRunId and filtered by the output URI
    (bucket and key prefix), retrieves corresponding files from ICAv2 via find_project_data_bulk, and compares
    the counts.

    Returns a JSON object with an isSynced boolean indicating whether the counts match.

    :param event: Dict containing at least 'outputUri' and 'portalRunId'.
    :param context: Lambda context (unused).
    :return: Dict with key 'isSynced' (True if synchronized, False otherwise).
    """
    # Set icav2 env vars
    set_icav2_env_vars()

    # Get the bucket, key from the event
    output_uri = event['outputUri']
    portal_run_id = event['portalRunId']
    icav2_project_data_obj = convert_uri_to_project_data_obj(output_uri)

    # Parse the s3 uri
    s3_bucket = urlparse(output_uri).netloc
    s3_key_prefix = urlparse(output_uri).path.lstrip('/')

    # Filemanager files (via attributes)
    filemanager_files = list(filter(
        # Remove iap temporary test files
        lambda file_obj_iter_: (
            # Not the iap temp copy test file
            ( not file_obj_iter_['key'].endswith('.iap_xaccount_test.tmp') ) and
            # Match the bucket and key prefix
            file_obj_iter_['bucket'] == s3_bucket and
            file_obj_iter_['key'].startswith(s3_key_prefix)
        ),
        # Get the files from the filemanager
        # NOTE: This call depends on the "Add the portal run id attributes" workflow step
        # having completed and the filemanager exposing the portalRunId attribute without
        # propagation delay. If the filemanager is eventually consistent, some recently
        # tagged files may not be returned here on the first invocation, in which case
        # the length check below will fail and the caller is expected to retry later.
        list_files_from_portal_run_id(portal_run_id)
    ))

    # List files via icav2
    icav2_project_data_list = find_project_data_bulk(
        project_id=icav2_project_data_obj.project_id,
        parent_folder_id=icav2_project_data_obj.data.id,
        data_type='FILE'
    )

    # If counts differ, report not-synced;
    # the calling Step Functions workflow handles retries as needed
    # In this case we retry after five seconds
    if len(filemanager_files) != len(icav2_project_data_list):
        logger.info(
            f"Filemanager has {len(filemanager_files)} files, "
            f"ICAv2 has {len(icav2_project_data_list)} files"
        )
        return {
            "isSynced": False,
        }

    # If the number of files is the same, we pass the check
    else:
        return {
            "isSynced": True,
        }
