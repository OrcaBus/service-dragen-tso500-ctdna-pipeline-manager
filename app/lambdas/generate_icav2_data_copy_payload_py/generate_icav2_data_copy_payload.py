#!/usr/bin/env python3

"""
Generate ICAv2 Data Copy Payload

Generate the dataCopyPayload object for the icav2 data copy service.

Given a list of fastqListRow objects generate the dataCopyPayload.

This should look something like the following:

sourceUriList - list of source uris to copy - these will be our fastq list rows
destinationUri - the location of these files.
renamingMapList - the list of renaming maps. Required IF the source uri file names don't match the convention needed
"""

# Standard imports
import typing
from typing import List, TypedDict
import re

# Layer imports

# Type hints
if typing.TYPE_CHECKING:
    from orcabus_api_tools.fastq.models import FastqListRowDict


class RenamingMapDict(TypedDict):
    sourceUri: str
    outputFileName: str


def get_sample_number_from_fastq_uri(fastq_uri: str) -> int:
    try:
        return int(re.match(r"(?:.*)?_S(\d+)_L(\d+)_R\d+_\d+.fastq.ora$", fastq_uri).group(1))
    except (AttributeError, ValueError):
        return 1  # Default to 1 if the regex fails or no match is found


def handler(event, context):
    """
    Generate ICAv2 Data Copy Payload
    """

    # Inputs
    fastq_list_rows: List[FastqListRowDict] = event.get("fastqListRows", [])
    run_folder_uri: str = event.get("runFolderUri")

    # Check fastq_list_rows is of length at least 1
    if len(fastq_list_rows) == 0:
        raise ValueError("fastqListRows is required in the event payload and must be a non-empty list")

    # Get the destination uri by appending the run folder uri with the rglb of the first fastq list row
    destination_uri: str = f"{run_folder_uri}{fastq_list_rows[0]['rglb']}/"

    # Generate the source uri and renaming map list for each fastq list row
    source_uri_list: List[str] = []
    renaming_map_list: List[RenamingMapDict] = []
    for fastq_list_row_iter_ in fastq_list_rows:
        # R1
        source_uri_list.append(fastq_list_row_iter_['read1FileUri'])
        renaming_map_list.append({
            "sourceUri": fastq_list_row_iter_['read1FileUri'],
            "outputFileName": "_".join([
                fastq_list_row_iter_['rglb'],
                f"S{get_sample_number_from_fastq_uri(fastq_list_row_iter_['read1FileUri'])}",
                f"L{str(fastq_list_row_iter_['lane']).zfill(3)}",
                "R1",
                "001.fastq.gz"
            ])
        })
        if fastq_list_row_iter_['read2FileUri'] is not None:
            source_uri_list.append(fastq_list_row_iter_['read2FileUri'])
            renaming_map_list.append({
                "sourceUri": fastq_list_row_iter_['read1FileUri'],
                "outputFileName": "_".join([
                    fastq_list_row_iter_['rglb'],
                    f"S{get_sample_number_from_fastq_uri(fastq_list_row_iter_['read2FileUri'])}",
                    f"L{str(fastq_list_row_iter_['lane']).zfill(3)}",
                    "R2",
                    "001.fastq.gz"
                ])
            })

    # Return the data copy payload
    return {
        "dataCopyPayload": {
            "sourceUriList": source_uri_list,
            "destinationUri": destination_uri,
            "renamingMapList": renaming_map_list
        }
    }
