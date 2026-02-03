import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StatelessApplicationStackConfig } from './interfaces';
import * as events from 'aws-cdk-lib/aws-events';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import { buildAllLambdas } from './lambdas';
import { buildAllStepFunctions } from './step-functions';
import { buildAllEventRules } from './event-rules';
import { buildAllEventBridgeTargets } from './event-targets';
import { ICAV2_ACCESS_TOKEN_SECRET_ID } from '@orcabus/platform-cdk-constructs/shared-config/icav2';
import { StageName } from '@orcabus/platform-cdk-constructs/shared-config/accounts';
import { buildTabixFargateTask } from './ecs';

export type StatelessApplicationStackProps = cdk.StackProps & StatelessApplicationStackConfig;

export class StatelessApplicationStack extends cdk.Stack {
  public stageName: StageName;

  constructor(scope: Construct, id: string, props: StatelessApplicationStackProps) {
    super(scope, id, props);

    /**
     * Dragen TSO500 ctDNA Stateless application stack
     */

    // Set the stage name attribute
    this.stageName = props.stageName;

    // Get the event bus as a construct
    const orcabusMainEventBus = events.EventBus.fromEventBusName(
      this,
      props.eventBusName,
      props.eventBusName
    );

    // Get the ICAV2 access token secret
    const icav2AccessTokenSecretObj = secretsManager.Secret.fromSecretNameV2(
      this,
      'icav2AccessTokenSecret',
      ICAV2_ACCESS_TOKEN_SECRET_ID[this.stageName]
    );

    // Build the lambdas
    const lambdas = buildAllLambdas(this);

    // Build the fargate task
    // Part 2 - Build ECS Tasks / Fargate Clusters
    const fargateTabixTaskObj = buildTabixFargateTask(this, {
      icav2AccessTokenSecretObj: icav2AccessTokenSecretObj,
    });

    // Build the state machines
    const stateMachines = buildAllStepFunctions(this, {
      lambdaObjects: lambdas,
      eventBus: orcabusMainEventBus,
      ssmParameterPaths: props.ssmParameterPaths,
      fargateTabixTaskObj: fargateTabixTaskObj,
    });

    // Add event rules
    const eventRules = buildAllEventRules(this, {
      eventBus: orcabusMainEventBus,
    });

    // Add event targets
    buildAllEventBridgeTargets({
      eventBridgeRuleObjects: eventRules,
      stepFunctionObjects: stateMachines,
    });
  }
}
