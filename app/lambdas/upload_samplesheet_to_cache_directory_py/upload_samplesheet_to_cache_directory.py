#!/usr/bin/env python3

# Standard library imports
from pathlib import Path
from time import sleep
from io import StringIO

# Wrapica imports
from wrapica.project_data import (
    write_icav2_file_contents, convert_uri_to_project_data_obj,
    convert_project_data_obj_to_uri, get_project_data_obj_by_id,
    get_project_data_obj_from_project_id_and_path, delete_project_data
)


# Layer imports
from icav2_tools import set_icav2_env_vars

# Globals
SAMPLESHEET_BASENAME = 'SampleSheet.csv'


def handler(event, context):
    """
    Lambda function handler to upload a sample sheet to the run directory.
    """
    set_icav2_env_vars()

    # Check inputs are present
    cache_uri = event.get("cacheUri")
    samplesheet_str = event.get('samplesheetStr')

    # Convert cache uri to project data object
    cache_project_data_obj = convert_uri_to_project_data_obj(
        cache_uri,
        create_data_if_not_found=True
    )

    # Check samplesheet doesn't already exist
    # And delete it if it does
    try:
        samplesheet_obj = get_project_data_obj_from_project_id_and_path(
            project_id=cache_project_data_obj.project_id,
            data_path=Path(cache_project_data_obj.data.details.path) / SAMPLESHEET_BASENAME,
            data_type="FILE",
            create_data_if_not_found=False
        )
    except FileNotFoundError:
        pass
    else:
        # Delete existing samplesheet
        delete_project_data(
            samplesheet_obj.project_id,
            samplesheet_obj.data.id
        )
        sleep(5)

    # Generate the samplesheet as a csv
    samplesheet_file_id = write_icav2_file_contents(
        project_id=cache_project_data_obj.project_id,
        data_path=Path(cache_project_data_obj.data.details.path) / SAMPLESHEET_BASENAME,
        file_stream_or_path=StringIO(samplesheet_str)
    )

    # Get the uri for the samplesheet file
    samplesheet_file_uri = convert_project_data_obj_to_uri(
        get_project_data_obj_by_id(cache_project_data_obj.project_id, samplesheet_file_id)
    )

    return {
        "samplesheetFileUri": samplesheet_file_uri,
    }


if __name__ == "__main__":
    # Imports
    from os import environ
    import json

    # Environ
    environ['AWS_REGION'] = 'ap-southeast-2'
    environ['AWS_PROFILE'] = 'umccr-development'
    environ['HOSTNAME_SSM_PARAMETER_NAME'] = '/hosted_zone/umccr/name'
    environ['ORCABUS_TOKEN_SECRET_ID'] = 'orcabus/token-service-jwt'
    environ['ICAV2_ACCESS_TOKEN_SECRET_ID'] = 'ICAv2JWTKey-umccr-prod-service-dev'

    print(json.dumps(
        handler(
        {
                "cacheUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/analysis/dragen-tso500-ctdna/2025073197468646/",
                "samplesheetStr": "[Header]\nFileFormatVersion,2\nRunName,241024_A00130_0336_BHW7MVDSXC\nInstrumentType,NovaSeq\n\n[Reads]\nRead1Cycles,151\nRead2Cycles,151\nIndex1Cycles,10\nIndex2Cycles,10\n\n[BCLConvert_Settings]\nAdapterBehavior,trim\nAdapterRead1,AGATCGGAAGAGCACACGTCTGAACTCCAGTCA\nAdapterRead2,AGATCGGAAGAGCGTCGTGTAGGGAAAGAGTGT\nMinimumTrimmedReadLength,35\nMaskShortReads,35\nOverrideCycles,U7N1Y143;I8N2;I8N2;U7N1Y143\n\n[BCLConvert_Data]\nLane,Sample_ID,index,index2\n1,L2401531,CTGAAGCT,TCAGAGCC\n\n[TSO500L_Settings]\nAdapterRead1,AGATCGGAAGAGCACACGTCTGAACTCCAGTCA\nAdapterRead2,AGATCGGAAGAGCGTCGTGTAGGGAAAGAGTGT\nMinimumTrimmedReadLength,35\nMaskShortReads,35\nOverrideCycles,U7N1Y143;I8N2;I8N2;U7N1Y143\n\n[TSO500L_Data]\nSample_ID,Sample_Type,Index,Index2,I7_Index_ID,I5_Index_ID\nL2401531,DNA,CTGAAGCT,TCAGAGCC,UP02,UP02\n"
            },
            None
        ),
        indent=4

    ))
