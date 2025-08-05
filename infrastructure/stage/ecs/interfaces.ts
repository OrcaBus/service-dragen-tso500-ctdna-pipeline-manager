/*
Interfaces
*/

import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';

export interface BuildTabixFargateEcsProps {
  icav2AccessTokenSecretObj: ISecret;
}
