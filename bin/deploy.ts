#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StatelessPipelineStack } from '../infrastructure/toolchain/stateless-pipeline-stack';
import { StatefulPipelineStack } from '../infrastructure/toolchain/stateful-pipeline-stack';
import { TOOLCHAIN_ENVIRONMENT } from '@orcabus/platform-cdk-constructs/deployment-stack-pipeline';

const app = new cdk.App();

const deployMode = app.node.tryGetContext('deployMode');
if (!deployMode) {
  throw new Error("deployMode is required in context (e.g. '-c deployMode=stateless')");
}

if (deployMode === 'stateless') {
  new StatelessPipelineStack(app, 'StatelessDragenTso500CtdnaPipeline', {
    env: TOOLCHAIN_ENVIRONMENT,
  });
} else if (deployMode === 'stateful') {
  new StatefulPipelineStack(
    app,
    /* TODO: Replace with string. Example: */ 'StatefulDragenTso500CtdnaPipeline',
    {
      env: TOOLCHAIN_ENVIRONMENT,
    }
  );
} else {
  throw new Error("Invalid 'deployMode` set in the context");
}
