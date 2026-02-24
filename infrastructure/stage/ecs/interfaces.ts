/*
Interfaces
*/

import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';

export interface BuildTabixFargateEcsProps {
  icav2AccessTokenSecretObj: ISecret;
  // SSM Parameter Prefixes
  storageConfigurationSsmParameterPathPrefix: string;
  projectToStorageConfigurationsSsmParameterPathPrefix: string;
  storageCredentialsSsmParameterPathPrefix: string;
}
