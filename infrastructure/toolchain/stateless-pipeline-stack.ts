import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DeploymentStackPipeline } from '@orcabus/platform-cdk-constructs/deployment-stack-pipeline';
import { getStatelessApplicationStackProps } from '../stage/config';
import { StatelessApplicationStack } from '../stage/stateless-application-stack';
import { REPO_NAME } from './constants';

export class StatelessPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new DeploymentStackPipeline(this, 'StatelessDragenTso500CtdnaPipeline', {
      unitAppTestConfig: {
        command: [],
      },
      githubBranch: 'main',
      githubRepo: REPO_NAME,
      stack: StatelessApplicationStack,
      stackName: 'StatelessDragenTso500Ctdna',
      stackConfig: {
        beta: getStatelessApplicationStackProps('BETA'),
        gamma: getStatelessApplicationStackProps('GAMMA'),
        prod: getStatelessApplicationStackProps('PROD'),
      },
      pipelineName: 'StatelessDragenTso500CtdnaPipeline',
      cdkSynthCmd: ['pnpm install --frozen-lockfile --ignore-scripts', 'pnpm cdk-stateless synth'],
    });
  }
}
