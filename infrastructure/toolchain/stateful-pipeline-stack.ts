import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DeploymentStackPipeline } from '@orcabus/platform-cdk-constructs/deployment-stack-pipeline';
import { getStatefulApplicationStackProps } from '../stage/config';
import { StatefulApplicationStack } from '../stage/stateful-application-stack';
import { REPO_NAME } from './constants';

export class StatefulPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new DeploymentStackPipeline(this, 'StatefulDragenTso500CtdnaPipeline', {
      githubBranch: 'main',
      githubRepo: REPO_NAME,
      stack: StatefulApplicationStack,
      stackName: 'StatefulDragenTso500Ctdna',
      stackConfig: {
        beta: getStatefulApplicationStackProps('BETA'),
        gamma: getStatefulApplicationStackProps('GAMMA'),
        prod: getStatefulApplicationStackProps('PROD'),
      },
      pipelineName: 'StatefulDragenTso500CtdnaPipeline',
      cdkSynthCmd: ['pnpm install --frozen-lockfile --ignore-scripts', 'pnpm cdk-stateful synth'],
    });
  }
}
