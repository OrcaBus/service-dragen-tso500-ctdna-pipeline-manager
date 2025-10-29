/* Directory constants */
import path from 'path';
import { StageName } from '@orcabus/platform-cdk-constructs/shared-config/accounts';
import { WorkflowVersionType } from './interfaces';
import { DATA_SCHEMA_REGISTRY_NAME } from '@orcabus/platform-cdk-constructs/shared-config/event-bridge';

export const APP_ROOT = path.join(__dirname, '../../app');
export const LAMBDA_DIR = path.join(APP_ROOT, 'lambdas');
export const STEP_FUNCTIONS_DIR = path.join(APP_ROOT, 'step-functions-templates');
export const EVENT_SCHEMAS_DIR = path.join(APP_ROOT, 'schemas');
export const ECS_DIR = path.join(APP_ROOT, 'ecs');

/* Stack constants */
export const STACK_PREFIX = 'orca-dragen-tso500-ctdna';

/* Workflow constants */
export const WORKFLOW_NAME = 'dragen-tso500-ctdna';
export const DEFAULT_WORKFLOW_VERSION: WorkflowVersionType = '2.6.0';
export const DEFAULT_PAYLOAD_VERSION = '2025.07.29';

export const WORKFLOW_LOGS_PREFIX = `s3://{__CACHE_BUCKET__}/{__CACHE_PREFIX__}logs/${WORKFLOW_NAME}/`;
export const WORKFLOW_OUTPUT_PREFIX = `s3://{__CACHE_BUCKET__}/{__CACHE_PREFIX__}analysis/${WORKFLOW_NAME}/`;
export const WORKFLOW_CACHE_PREFIX = `s3://{__CACHE_BUCKET__}/{__CACHE_PREFIX__}cache/${WORKFLOW_NAME}/`;

/* We extend this every time we release a new version of the workflow */
/* This is added into our SSM Parameter Store to allow us to map workflow versions to pipeline IDs */
export const WORKFLOW_VERSION_TO_DEFAULT_ICAV2_PIPELINE_ID_MAP: Record<
  WorkflowVersionType,
  string
> = {
  // https://ica.illumina.com/ica/bundles/b753fbd9-453b-428d-89bd-8596de7337de/pipelines/63dc920c-adde-4891-8aae-84a6b9569f37
  // urn:ilmn:ica:pipeline:63dc920c-adde-4891-8aae-84a6b9569f37#DRAGEN_TruSight_Oncology_500_ctDNA_v2_6_0_25
  // Uses F2 instances
  '2.6.0': '63dc920c-adde-4891-8aae-84a6b9569f37',
  // https://ica.illumina.com/ica/bundles/fbdb909d-321b-4a0f-8e4e-8e5b0884dac4/pipelines/67675369-6129-4b21-918c-eceb3dced88d
  // urn:ilmn:ica:pipeline:67675369-6129-4b21-918c-eceb3dced88d#DRAGEN_TruSight_Oncology_500_ctDNA_v2_6_1_8
  '2.6.1': '67675369-6129-4b21-918c-eceb3dced88d',
};

/* SSM Parameter Paths */
export const SSM_PARAMETER_PATH_PREFIX = path.join(`/orcabus/workflows/${WORKFLOW_NAME}/`);
// Workflow Parameters
export const SSM_PARAMETER_PATH_WORKFLOW_NAME = path.join(
  SSM_PARAMETER_PATH_PREFIX,
  'workflow-name'
);
export const SSM_PARAMETER_PATH_DEFAULT_WORKFLOW_VERSION = path.join(
  SSM_PARAMETER_PATH_PREFIX,
  'default-workflow-version'
);
// Engine Parameters
export const SSM_PARAMETER_PATH_PREFIX_PIPELINE_IDS_BY_WORKFLOW_VERSION = path.join(
  SSM_PARAMETER_PATH_PREFIX,
  'pipeline-ids-by-workflow-version'
);
export const SSM_PARAMETER_PATH_ICAV2_PROJECT_ID = path.join(
  SSM_PARAMETER_PATH_PREFIX,
  'icav2-project-id'
);
export const SSM_PARAMETER_PATH_PAYLOAD_VERSION = path.join(
  SSM_PARAMETER_PATH_PREFIX,
  'payload-version'
);
export const SSM_PARAMETER_PATH_LOGS_PREFIX = path.join(SSM_PARAMETER_PATH_PREFIX, 'logs-prefix');
export const SSM_PARAMETER_PATH_OUTPUT_PREFIX = path.join(
  SSM_PARAMETER_PATH_PREFIX,
  'output-prefix'
);
export const SSM_PARAMETER_PATH_CACHE_PREFIX = path.join(SSM_PARAMETER_PATH_PREFIX, 'cache-prefix');

/* Event Constants */
export const EVENT_BUS_NAME = 'OrcaBusMain';
export const EVENT_SOURCE = 'orcabus.dragentso500ctdna';
export const WORKFLOW_RUN_STATE_CHANGE_DETAIL_TYPE = 'WorkflowRunStateChange';
export const WORKFLOW_RUN_UPDATE_DETAIL_TYPE = 'WorkflowRunUpdate';
export const ICAV2_WES_REQUEST_DETAIL_TYPE = 'Icav2WesRequest';
export const ICAV2_WES_STATE_CHANGE_DETAIL_TYPE = 'Icav2WesAnalysisStateChange';

export const WORKFLOW_MANAGER_EVENT_SOURCE = 'orcabus.workflowmanager';
export const ICAV2_WES_EVENT_SOURCE = 'orcabus.icav2wesmanager';

export const FASTQ_SYNC_DETAIL_TYPE = 'FastqSync';
export const FASTQ_DECOMPRESSION_DETAIL_TYPE = 'OraDecompressionRequestSync';

/* Event rule constants */
export const DRAFT_STATUS = 'DRAFT';
export const READY_STATUS = 'READY';

/* Schema constants */
export const SCHEMA_REGISTRY_NAME = DATA_SCHEMA_REGISTRY_NAME;
export const SSM_SCHEMA_ROOT = path.join(SSM_PARAMETER_PATH_PREFIX, 'schemas');

/* Future proofing */
export const NEW_WORKFLOW_MANAGER_IS_DEPLOYED: Record<StageName, boolean> = {
  BETA: true,
  GAMMA: true,
  PROD: true,
};
