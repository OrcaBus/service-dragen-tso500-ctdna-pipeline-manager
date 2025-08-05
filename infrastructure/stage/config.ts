import { StageName } from '@orcabus/platform-cdk-constructs/shared-config/accounts';
import {
  DEFAULT_PAYLOAD_VERSION,
  DEFAULT_WORKFLOW_VERSION,
  EVENT_BUS_NAME,
  NEW_WORKFLOW_MANAGER_IS_DEPLOYED,
  SSM_PARAMETER_PATH_CACHE_PREFIX,
  SSM_PARAMETER_PATH_DEFAULT_WORKFLOW_VERSION,
  SSM_PARAMETER_PATH_ICAV2_PROJECT_ID,
  SSM_PARAMETER_PATH_LOGS_PREFIX,
  SSM_PARAMETER_PATH_OUTPUT_PREFIX,
  SSM_PARAMETER_PATH_PAYLOAD_VERSION,
  SSM_PARAMETER_PATH_PREFIX,
  SSM_PARAMETER_PATH_PREFIX_PIPELINE_IDS_BY_WORKFLOW_VERSION,
  SSM_PARAMETER_PATH_WORKFLOW_NAME,
  WORKFLOW_CACHE_PREFIX,
  WORKFLOW_LOGS_PREFIX,
  WORKFLOW_NAME,
  WORKFLOW_OUTPUT_PREFIX,
  WORKFLOW_VERSION_TO_DEFAULT_ICAV2_PIPELINE_ID_MAP,
} from './constants';

import { ICAV2_PROJECT_ID } from '@orcabus/platform-cdk-constructs/shared-config/icav2';
import { substituteBucketConstants } from './utils';
import { SsmParameterPaths, SsmParameterValues } from './ssm/interfaces';
import { StatefulApplicationStackConfig, StatelessApplicationStackConfig } from './interfaces';

export const getSsmParameterPaths = (): SsmParameterPaths => {
  return {
    // Top level prefix
    ssmRootPrefix: SSM_PARAMETER_PATH_PREFIX,

    // Detail
    workflowName: SSM_PARAMETER_PATH_WORKFLOW_NAME,
    workflowVersion: SSM_PARAMETER_PATH_DEFAULT_WORKFLOW_VERSION,

    // Payload
    payloadVersion: SSM_PARAMETER_PATH_PAYLOAD_VERSION,

    // Engine Parameters
    prefixPipelineIdsByWorkflowVersion: SSM_PARAMETER_PATH_PREFIX_PIPELINE_IDS_BY_WORKFLOW_VERSION,
    icav2ProjectId: SSM_PARAMETER_PATH_ICAV2_PROJECT_ID,
    logsPrefix: SSM_PARAMETER_PATH_LOGS_PREFIX,
    outputPrefix: SSM_PARAMETER_PATH_OUTPUT_PREFIX,
    cachePrefix: SSM_PARAMETER_PATH_CACHE_PREFIX,
  };
};

export const getSsmParameterValues = (stage: StageName): SsmParameterValues => {
  return {
    // Values
    // Detail
    workflowName: WORKFLOW_NAME,
    workflowVersion: DEFAULT_WORKFLOW_VERSION,

    // Payload
    payloadVersion: DEFAULT_PAYLOAD_VERSION,

    // Engine Parameters
    pipelineIdsByWorkflowVersionMap: WORKFLOW_VERSION_TO_DEFAULT_ICAV2_PIPELINE_ID_MAP,
    icav2ProjectId: ICAV2_PROJECT_ID[stage],

    // Engine parameter prefixes
    logsPrefix: substituteBucketConstants(WORKFLOW_LOGS_PREFIX, stage),
    outputPrefix: substituteBucketConstants(WORKFLOW_OUTPUT_PREFIX, stage),
    cachePrefix: substituteBucketConstants(WORKFLOW_CACHE_PREFIX, stage),
  };
};

export const getStatefulApplicationStackProps = (
  stage: StageName
): StatefulApplicationStackConfig => {
  return {
    // SSM Parameter Paths
    ssmParameterPaths: getSsmParameterPaths(),

    // Event Bus Object
    ssmParameterValues: getSsmParameterValues(stage),
  };
};

export const getStatelessApplicationStackProps = (
  stage: StageName
): StatelessApplicationStackConfig => {
  return {
    // Stage name
    stageName: stage,

    // SSM Parameter Paths
    ssmParameterPaths: getSsmParameterPaths(),

    // Event Bus Object
    eventBusName: EVENT_BUS_NAME,

    // Is the new workflow management system enabled?
    isNewWorkflowManagementEnabled: NEW_WORKFLOW_MANAGER_IS_DEPLOYED[stage],
  };
};
