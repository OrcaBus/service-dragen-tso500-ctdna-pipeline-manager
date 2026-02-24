export interface SsmParameterValues {
  // Payload defaults
  workflowName: string;
  payloadVersion: string;
  workflowVersion: string;

  // Engine Parameter defaults
  pipelineIdsByWorkflowVersionMap: Record<string, string>;
  icav2ProjectId: string;
  logsPrefix: string;
  outputPrefix: string;
  cachePrefix: string;
}

export interface SsmParameterPaths {
  // Top level prefix
  ssmRootPrefix: string;

  // Payload defaults
  workflowName: string;
  payloadVersion: string;
  workflowVersion: string;

  // Engine Parameter defaults
  prefixPipelineIdsByWorkflowVersion: string;
  icav2ProjectId: string;
  logsPrefix: string;
  outputPrefix: string;
  cachePrefix: string;

  // ICA Ssm Parameter Paths
  storageConfigurationSsmParameterPathPrefix: string;
  projectToStorageConfigurationsSsmParameterPathPrefix: string;
  storageCredentialsSsmParameterPathPrefix: string;
}

export interface BuildSsmParameterProps {
  ssmParameterValues: SsmParameterValues;
  ssmParameterPaths: SsmParameterPaths;
}
