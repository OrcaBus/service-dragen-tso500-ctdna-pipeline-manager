#!/usr/bin/env python3

"""
Given a sample id and a cache uri

{
    "instrumentRunId": "<AN INSTRUMENT RUN ID>",
    "cacheUri": "icav2://7595e8f2-32d3-4c76-a324-c6a85dae87b5/ilmn_cttso_fastq_cache/20240510abcd0026/cache/"
}

Checks that the cache_uri is a valid directory and contains the directory:
cacheUri
and the file
cache_uri / SampleSheet.csv

"""

# Standard imports
import logging

# Wrapica imports
from wrapica.project_data import (
    convert_uri_to_project_data_obj,
    list_project_data_non_recursively,
    delete_project_data
)
from wrapica.utils.globals import FILE_DATA_TYPE
from wrapica.utils.globals import FOLDER_DATA_TYPE

# Layer imports
from icav2_tools import set_icav2_env_vars


# Set loggers
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    """
    Import
    Args:
        event:
        context:

    Returns:

    """
    set_icav2_env_vars()

    # Part 0 - get inputs
    sample_id = event.get("sampleId", None)
    cache_uri = event.get("cacheUri", None)

    # Check sample id
    if sample_id is None:
        raise ValueError("No sample_id provided")

    # Check cache uri
    if cache_uri is None:
        raise ValueError("No cache_uri provided")

    # Part 1 - check that in the cache uri, only the instrument_run_id directory exists along with the file SampleSheet.csv
    try:
        cache_obj = convert_uri_to_project_data_obj(cache_uri)
    except NotADirectoryError as e:
        logger.info("Cache directory has already been deleted")
        return None

    cache_folder_list = list_project_data_non_recursively(
        project_id=cache_obj.project_id,
        parent_folder_id=cache_obj.data.id,
    )

    # Check that the directory has two entries overall
    if not len(cache_folder_list) == 2:
        raise ValueError(
            f"Expected two entries in the cache folder list, SampleSheet.csv and the instrument run directory "
            f"but got {len(cache_folder_list)}: "
            f"{', '.join([project_data_obj.data.details.name for project_data_obj in cache_folder_list])}"
        )

    # Instrument run id folder should be the only folder in the cache uri
    instrument_run_id_folder = next(
        filter(
            lambda project_data_obj_iter: project_data_obj_iter.data.details.data_type == FOLDER_DATA_TYPE,
            cache_folder_list
        )
    )

    instrument_run_id_folder_contents = list_project_data_non_recursively(
        project_id=instrument_run_id_folder.project_id,
        parent_folder_id=instrument_run_id_folder.data.id,
    )

    # Check that the instrument_run_id directory exists
    try:
        sample_folder_obj = next(
            filter(
                lambda project_data_obj_iter: project_data_obj_iter.data.details.name == sample_id,
                instrument_run_id_folder_contents
            )
        )
    except StopIteration:
        raise ValueError(f"Instrument Run ID with sample {sample_id} does not exist in cache uri {cache_uri}")

    # Confirm that only fastq files exist inside the sample folder obj
    sample_folder_list = list_project_data_non_recursively(
        project_id=cache_obj.project_id,
        parent_folder_id=sample_folder_obj.data.id,
    )

    try:
        not_fastq_file_obj = next(
            filter(
                lambda project_data_obj_iter: (
                        (not project_data_obj_iter.data.details.name.endswith(".fastq.gz")) or
                        (not project_data_obj_iter.data.details.data_type == FILE_DATA_TYPE)
                ),
                sample_folder_list
            )
        )
    except StopIteration:
        # We expect to get here, we do not expect any non-fastq files in the sample folder
        pass
    else:
        raise ValueError(
            f"Non-fastq file {not_fastq_file_obj.data.details.name} exists in the "
            f"cache uri {cache_uri}"
        )

    # Check that the SampleSheet.csv file exists
    try:
        sample_sheet_csv_obj = next(
            filter(
                lambda project_data_obj_iter: project_data_obj_iter.data.details.name == "SampleSheet.csv",
                cache_folder_list
            )
        )
    except StopIteration:
        raise ValueError(f"SampleSheet.csv does not exist in the cache uri {cache_uri}")

    # Check that the directory has two entries overall
    if not len(cache_folder_list) == 2:
        raise ValueError(
            f"Expected two entries in the cache folder list, SampleSheet.csv and the instrument run directory "
            f"but got {len(cache_folder_list)}: "
            f"{', '.join([project_data_obj.data.details.name for project_data_obj in cache_folder_list])}"
        )

    # Delete the cache directory
    delete_project_data(
        project_id=cache_obj.project_id,
        data_id=cache_obj.data.id,
    )


# if __name__ == "__main__":
#     import json
#     from os import environ
#     environ['AWS_PROFILE'] = 'umccr-development'
#     environ['ICAV2_ACCESS_TOKEN_SECRET_ID'] = "ICAv2JWTKey-umccr-prod-service-dev"
#     print(
#         json.dumps(
#             handler(
#                 event={
#                     "sampleId": "L2401531",
#                     "cacheUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/cache/dragen-tso500-ctdna/20250731297576d3/"
#                 },
#                 context=None
#             ),
#             indent=4
#         )
#     )
#     # null
