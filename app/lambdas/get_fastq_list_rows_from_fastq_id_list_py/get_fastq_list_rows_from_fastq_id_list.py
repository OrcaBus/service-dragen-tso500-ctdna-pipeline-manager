#!/usr/bin/env python3

# Standard imports
from typing import List

# Layer imports
from orcabus_api_tools.fastq import to_fastq_list_row
from orcabus_api_tools.fastq.models import FastqListRowDict


def handler(event, context):
    """
    Lambda handler to convert a list of FASTQ files into a list of rows.
    :param event:
    :param context:
    :return:
    """

    # Get the fastqList from the event
    fastq_id_list = event.get("fastqIdList", [])

    # Convert each FASTQ file in the list to a row format
    fastq_list_rows: List[FastqListRowDict] = list(map(
        lambda fastq_id_iter_: to_fastq_list_row(fastq_id_iter_),
        fastq_id_list
    ))

    # Return the list of fastq list row dicts
    return {
        "fastqListRows": fastq_list_rows
    }


# if __name__ == "__main__":
#     from os import environ
#     import json
#     environ['AWS_PROFILE'] = 'umccr-development'
#     environ['HOSTNAME_SSM_PARAMETER_NAME'] = '/hosted_zone/umccr/name'
#     environ['ORCABUS_TOKEN_SECRET_ID'] = 'orcabus/token-service-jwt'
#     print(json.dumps(
#         handler(
#             {
#                 "fastqIdList": [
#                     "fqr.01JQ3BETZ1J2T7FZCW4XMY9Y8N"
#                 ]
#             },
#             None),
#         indent=4
#     ))
#
#     # {
#     #     "fastqListRows": [
#     #         {
#     #             "rgid": "CTGAAGCT+TCAGAGCC.1.241024_A00130_0336_BHW7MVDSXC",
#     #             "rglb": "L2401531",
#     #             "rgsm": "L2401531",
#     #             "lane": 1,
#     #             "rgcn": "UMCCR",
#     #             "rgds": "Library ID: L2401531 / Sequenced on 24 Oct 2024 at UMCCR / Phenotype: tumor / Assay: ctTSO / Type: ctDNA",
#     #             "rgdt": "2024-10-24",
#     #             "rgpl": "Illumina",
#     #             "read1FileUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/primary/241024_A00130_0336_BHW7MVDSXC/20250611c473883f/Samples/Lane_1/L2401531/L2401531_S6_L001_R1_001.fastq.ora",
#     #             "read2FileUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/primary/241024_A00130_0336_BHW7MVDSXC/20250611c473883f/Samples/Lane_1/L2401531/L2401531_S6_L001_R2_001.fastq.ora"
#     #         }
#     #     ]
#     # }
