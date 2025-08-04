#!/usr/bin/env python3

"""
Convert ICAv2 WES State Change Event to WRSC Event

Given an ICAv2 WES State Change Event, this script converts it to a WRSC Event.

{
  "id": "iwa.01JWAGE5PWS5JN48VWNPYSTJRN",
  "name": "umccr--automated--tso500-ctdna--2024-05-24--20250417abcd1234",
  "inputs": {
    // Cache URI path to the decompressed run folder
    "run_folder": "s3://bucket/to/cache_uri/run/folder/",
    // Sample sheet for the run, generated from the fastq list rows
    "sample_sheet": "s3://bucket/to/cache_uri/sample_sheet.csv",
    // We will always start from fastq files, so this will always be true
    "StartsFromFastq": True
    // Sample Pair IDs
    "sample_pair_ids": [
      "TheLibraryID"
    ]
  },
  "engineParameters": {
    "pipelineId": "55a8bb47-d32b-48dd-9eac-373fd487ccec",
    "projectId": "ea19a3f5-ec7c-4940-a474-c31cd91dbad4",
    "outputUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/test_data/bclconvert-interop-qc-test/",
    "cacheUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/test_data/cache/bclconvert-interop-qc-test/"
    "logsUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/test_data/logs/bclconvert-interop-qc-test/"
  },
  "tags": {
    "instrumentRunId": "20231010_pi1-07_0329_A222N7LTD3",
    "portalRunId": "20250417abcd1234"  // pragma: allowlist secret
    "libraryId": "L123456",
    "subjectId": "MyTSO500Subject",
    "individualId": "MyTSO500Individual"
  },
  "status": "SUBMITTED",
  "submissionTime": "2025-05-28T03:54:35.612655",
  "stepsLaunchExecutionArn": "arn:aws:states:ap-southeast-2:843407916570:execution:icav2-wes-launchIcav2Analysis:3f176fc2-d8e0-4bd5-8d2f-f625d16f6bf6",
  "icav2AnalysisId": null,
  "startTime": "2025-05-28T03:54:35.662401+00:00",
  "endTime": null
}

TO

{
  // status - Required - and must be set to DRAFT
  "status": "DRAFT",
  // timestamp - Required - set in UTC / ZULU time
  "timestamp": "2025-06-20T04:39:31Z",
  // workflowName - Required - Must be set to dragen-tso500-ctdna
  "workflowName": "dragen-tso500-ctdna",
  // workflowVersion - Required - Must be set to 2.6.1
  "workflowVersion": "2.6.1",
  // workflowRunName - Required - Nomenclature is umccr--automated--dragen-tso500-ctdna--<workflowVersion>--<portalRunId>
  "workflowRunName": "umccr--automated--dragen-tso500-ctdna--2-6-1--20250620abcd6789",
  // portalRunId - Required - Must be set to a unique identifier for the run in the format YYYYMMDD<8-hex-digit-unique-id>
  "portalRunId": "20250620abcd6789",  // pragma: allowlist secret
  // linkedLibraries - Required - List of linked libraries, in the format
  // 'libraryId': '<libraryId>', 'orcabusId': '<orcabusId>'
  "linkedLibraries": [
    {
      "libraryId": "L2301197",
      "orcabusId": "lib.01JBMVHM2D5GCC7FTC20K4FDFK"
    }
  ],
  // payload - The payload for the workflow run, containing all the necessary data
  "payload": {
    // version - The version of the payload schema used by this service
    // Not currently used by the service, but may be used in future
    "version": "2025.06.20",
    // data - The data for the workflow run, containing inputs, engine parameters, and tags
    "data": {
      // all inputs for the dragen-tso-ctdna pipeline
      "inputs": {
        // Input options are very limited for this pipeline, as it is designed to run from BCLs
        // We generate the samplesheet internally, and expect the rgid to be in <index>.<lane>.<instrument_run_id> format
        // To ensure that we properly generate the samplesheet
        // Currently we only support fastq list rows that are on the same instrument run id
        "fastqListRows": [
          {
            "rgid": "AAAAAAA+GGGGGGGG.4.240902_A01030_0366_ABCD1234567",
            "rglb": "L2301197",
            "rgsm": "L2301197",
            "lane": 1,
            "read1FileUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/test_data/ora-testing/input_data/MDX230428_L2301197_S7_L004_R1_001.fastq.ora",
            "read2FileUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/test_data/ora-testing/input_data/MDX230428_L2301197_S7_L004_R2_001.fastq.ora"
          }
        ]
      },
      // engineParameters - Parameters for the pipeline engine
      "engineParameters": {
        // Not required, defaults to the default pipeline for the workflowVersion specified
        "pipelineId": "5009335a-8425-48a8-83c4-17c54607b44a",
        // Not required, defaults to the default project id
        "projectId": "ea19a3f5-ec7c-4940-a474-c31cd91dbad4",
        // Not required, defaults to the default workflow output prefix
        "outputUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/analysis/dragen-tso500-ctdna/20250620abcd6789/",
        // Not required, defaults to the default workflow logs prefix
        "logsUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/logs/dragen-tso500-ctdna/20250620abcd6789/",
        // Not required, defaults to the default workflow cache prefix
        "cacheUri": "s3://pipeline-dev-cache-503977275616-ap-southeast-2/byob-icav2/development/cache/dragen-tso500-ctdna/20250620abcd6789/",
      },
      "tags": {
        // libraryId, required, the germline library ID for the workflow run
        "libraryId": "L2301197",
        // fastqRgidList, not required, a list of fastq RGIDs for the workflow run
        // If not provided, will be populated from the fastq manager for the current fastq set for the library id provided
        "fastqRgidList": [
          "AAAAAAA+GGGGGGGG.4.240902_A01030_0366_ABCD1234567"
        ],
        // subjectId, not required, the subject ID for the workflow run
        // If not provided, will be populated by the metadata manager from the libraryId provided
        "subjectId": "ExternalSubjectId",
        // individualId - not required, the individual ID for the workflow run
        "individualId": "InternalSubjectId",
      }
    }
  }
}
"""

# Standard imports
from copy import deepcopy
from datetime import datetime, timezone

# Layer helpers
from orcabus_api_tools.workflow.payload_helpers import get_latest_payload_from_workflow_run
from orcabus_api_tools.workflow.workflow_run_helpers import get_workflow_run_from_portal_run_id


def handler(event, context):
    """
    Perform the following steps:
    1. Get portal run ID from ICAv2 WES Event Tags
    2. Look up workflow run / payload using the portal run ID
    3. Generate the WRSC Event payload based on the existing WRSC Event payload
    :param event:
    :param context:
    :return:
    """

    # ICAV2 WES State Change Event payload
    icav2_wes_event = event['icav2WesStateChangeEvent']

    # Get the portal run ID from the event tags
    portal_run_id = icav2_wes_event['tags']['portalRunId']

    # Get the workflow run using the portal run ID
    workflow_run = get_workflow_run_from_portal_run_id(portal_run_id)

    # Get the latest payload from the workflow run
    latest_payload = get_latest_payload_from_workflow_run(workflow_run['orcabusId'])

    # Check if the status was SUCCEEDED, if so we populate the 'outputs' data payload
    if icav2_wes_event['status'] == 'SUCCEEDED':
        # We want to generate the following output dict
        inputs = icav2_wes_event['inputs']
        outputs = {
          "sampleResultsDirRelPath": f"Results/{inputs['sample_pair_ids'][0]}/",
          "tso500NextflowLogsRelPath": "TSO500_Nextflow_Logs/",
          "LogsIntermediatesRelPath": "Logs_Intermediates/",
        }
    else:
        outputs = None

    # Update the latest payload with the outputs if available
    if outputs:
        latest_payload['data']['outputs'] = outputs

    # Update the workflow object to contain 'name' and 'version'
    workflow = dict(deepcopy(workflow_run['workflow']))

    # Prepare the WRSC Event payload
    return {
        "workflowRunStateChangeEvent": {
            # New status
            "status": icav2_wes_event['status'],
            # Current time
            "timestamp": datetime.now(timezone.utc).isoformat(timespec='seconds').replace("+00:00", "Z"),
            # Portal Run ID
            "portalRunId": portal_run_id,
            # Workflow details
            "workflow": workflow,
            "workflowRunName": workflow_run['workflowRunName'],
            # Linked libraries in workflow run
            "libraries": workflow_run['libraries'],
            # Payload containing the original inputs and engine parameters
            # But with the updated outputs if available
            "payload": {
                "version": latest_payload['version'],
                "data": latest_payload['data']
            }
        }
    }


# if __name__ == "__main__":
#     import json
#     from os import environ
#     environ['AWS_PROFILE'] = 'umccr-production'
#     environ['AWS_REGION'] = 'ap-southeast-2'
#     environ['HOSTNAME_SSM_PARAMETER_NAME'] = '/hosted_zone/umccr/name'
#     environ['ORCABUS_TOKEN_SECRET_ID'] = 'orcabus/token-service-jwt'
#
#     print(json.dumps(
#         handler(
#             {
#                 "icav2WesStateChangeEvent": {
#                     "id": "iwa.01JY07DV46QMQJWH1J1Y8YFR27",
#                     "name": "umccr--automated--dragen-wgts-dna--4-4-4--20250617ac346b29",
#                     "inputs": {
#                         "alignment_options": {
#                             "enable_duplicate_marking": True
#                         },
#                         "targeted_caller_options": {
#                             "enable_targeted": [
#                                 "cyp2d6"
#                             ]
#                         },
#                         "snv_variant_caller_options": {
#                             "qc_detect_contamination": True,
#                             "vc_mnv_emit_component_calls": True,
#                             "vc_combine_phased_variants_distance": 2,
#                             "vc_combine_phased_variants_distance_snvs_only": 2
#                         },
#                         "sequence_data": {
#                             "fastq_list_rows": [
#                                 {
#                                     "rgid": "CTGCTTCC+GATCTATC.4.250328_A01052_0258_AHFGM7DSXF",
#                                     "rglb": "L2500373",
#                                     "rgsm": "L2500373",
#                                     "lane": 4,
#                                     "rgcn": "UMCCR",
#                                     "rgds": "Library ID: L2500373, Sequenced on 28 Mar, 2025 at UMCCR, Phenotype: normal, Assay: TsqNano, Type: WGS",
#                                     "rgdt": "2025-03-28T00:00:00",
#                                     "rgpl": "Illumina",
#                                     "read_1": {
#                                         "class": "File",
#                                         "location": "s3://pipeline-prod-cache-503977275616-ap-southeast-2/byob-icav2/production/ora-compression/250328_A01052_0258_AHFGM7DSXF/20250402ebfe2c3d/Samples/Lane_4/L2500373/L2500373_S28_L004_R1_001.fastq.ora"
#                                     },
#                                     "read_2": {
#                                         "class": "File",
#                                         "location": "s3://pipeline-prod-cache-503977275616-ap-southeast-2/byob-icav2/production/ora-compression/250328_A01052_0258_AHFGM7DSXF/20250402ebfe2c3d/Samples/Lane_4/L2500373/L2500373_S28_L004_R2_001.fastq.ora"
#                                     }
#                                 }
#                             ]
#                         },
#                         "sample_name": "L2500373",
#                         "reference": {
#                             "name": "hg38",
#                             "structure": "graph",
#                             "tarball": {
#                                 "class": "File",
#                                 "location": "s3://pipeline-prod-cache-503977275616-ap-southeast-2/byob-icav2/reference-data/dragen-hash-tables/v11-r5/hg38-alt_masked-cnv-graph-hla-methyl_cg-rna/hg38-alt_masked.cnv.graph.hla.methyl_cg.rna-11-r5.0-1.tar.gz"
#                             }
#                         },
#                         "ora_reference": {
#                             "class": "File",
#                             "location": "s3://pipeline-prod-cache-503977275616-ap-southeast-2/byob-icav2/reference-data/dragen-ora/v2/ora_reference_v2.tar.gz"
#                         }
#                     },
#                     "engineParameters": {
#                         "pipelineId": "d3228141-3753-40bc-8d22-ac91f1e37e75",
#                         "projectId": "eba5c946-1677-441d-bbce-6a11baadecbb",
#                         "outputUri": "s3://pipeline-prod-cache-503977275616-ap-southeast-2/byob-icav2/production/analysis/dragen-wgts-dna/20250617ac346b29/",
#                         "logsUri": "s3://pipeline-prod-cache-503977275616-ap-southeast-2/byob-icav2/production/logs/dragen-wgts-dna/20250617ac346b29/"
#                     },
#                     "tags": {
#                         "libraryId": "L2500373",
#                         "fastqRgidList": [
#                             "CTGCTTCC+GATCTATC.4.250328_A01052_0258_AHFGM7DSXF"
#                         ],
#                         "subjectId": "AIRSPACE-194-5",
#                         "individualId": "SBJ06472",
#                         "preLaunchCoverageEst": 34.79,
#                         "preLaunchDupFracEst": 0.26,
#                         "preLaunchInsertSizeEst": 286,
#                         "portalRunId": "20250617ac346b29"  # pragma: allowlist secret
#                     },
#                     "status": "SUCCEEDED",
#                     "submissionTime": "2025-06-18T00:36:06.918455",
#                     "stepsLaunchExecutionArn": "arn:aws:states:ap-southeast-2:472057503814:execution:icav2-wes-launchIcav2Analysis:8a76fee5-8d1a-43e6-9ad6-3deb368a87ba",
#                     "icav2AnalysisId": "72f51fcd-ab9c-4f61-80ca-e483f8dc58b6",
#                     "startTime": "2025-06-18T00:36:07.154707+00:00",
#                     "endTime": "2025-06-18T02:46:32.146135+00:00"
#                 }
#             },
#             None
#         ),
#         indent=4
#     ))
#
