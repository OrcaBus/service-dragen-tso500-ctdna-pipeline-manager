import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { buildSsmParameters } from './ssm';
import { buildSchemas } from './event-schemas';
import { StatefulApplicationStackConfig } from './interfaces';

export type StatefulApplicationStackProps = cdk.StackProps & StatefulApplicationStackConfig;

export class StatefulApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StatefulApplicationStackProps) {
    super(scope, id, props);

    /**
     * Dragen TSO500 ctDNA Stateful application stack
     */

    // Build SSM Parameters
    buildSsmParameters(this, {
      ssmParameterPaths: props.ssmParameterPaths,
      ssmParameterValues: props.ssmParameterValues,
    });

    // Build Schema stack
    buildSchemas(this);
  }
}
