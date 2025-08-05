import { SsmParameterPaths, SsmParameterValues } from './ssm/interfaces';
import { StageName } from '@orcabus/platform-cdk-constructs/shared-config/accounts';

export interface StatefulApplicationStackConfig {
  // Values
  // Detail
  ssmParameterValues: SsmParameterValues;

  // Keys
  ssmParameterPaths: SsmParameterPaths;
}

export interface StatelessApplicationStackConfig {
  // StageName
  stageName: StageName;

  // SSM Parameter Keys
  ssmParameterPaths: SsmParameterPaths;

  // Event Stuff
  eventBusName: string;

  // Is new workflow enabled?
  isNewWorkflowManagementEnabled: boolean;
}
