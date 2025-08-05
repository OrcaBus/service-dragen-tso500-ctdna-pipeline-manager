#!/usr/bin/env python3

"""
Get the instrument run id from a fastq id
"""

from orcabus_api_tools.fastq import get_fastq

def handler(event, context):
    """
    Get the instrument run id from a fastq id
    :param event:
    :param context:
    :return:
    """

    return {
        "instrumentRunId": get_fastq(event['fastqId'])['instrumentRunId'],
    }
