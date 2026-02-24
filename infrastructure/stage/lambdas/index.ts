import { LambdaInput, lambdaNamesList, LambdaObject, lambdaRequirementsMap } from './interfaces';
import { PythonUvFunction } from '@orcabus/platform-cdk-constructs/lambda';
import {
  LAMBDA_DIR,
  SCHEMA_REGISTRY_NAME,
  SSM_SCHEMA_ROOT,
  TEST_DATA_BUCKET_NAME,
  WORKFLOW_NAME,
} from '../constants';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { camelCaseToKebabCase, camelCaseToSnakeCase } from '../utils';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import { SchemaNames } from '../event-schemas/interfaces';

function buildLambda(scope: Construct, props: LambdaInput): LambdaObject {
  const lambdaNameToSnakeCase = camelCaseToSnakeCase(props.lambdaName);
  const lambdaRequirements = lambdaRequirementsMap[props.lambdaName];

  // Create the lambda function
  const lambdaFunction = new PythonUvFunction(scope, props.lambdaName, {
    entry: path.join(LAMBDA_DIR, lambdaNameToSnakeCase + '_py'),
    runtime: lambda.Runtime.PYTHON_3_14,
    architecture: lambda.Architecture.ARM_64,
    index: lambdaNameToSnakeCase + '.py',
    handler: 'handler',
    timeout: Duration.seconds(60),
    memorySize: 2048,
    includeOrcabusApiToolsLayer: lambdaRequirements.needsOrcabusApiToolsLayer,
    includeIcav2Layer: lambdaRequirements.needsIcav2ToolsLayer,
  });

  // AwsSolutions-IAM4 - We need to add this for the lambda to work
  NagSuppressions.addResourceSuppressions(
    lambdaFunction,
    [
      {
        id: 'AwsSolutions-IAM4',
        reason: 'We need to add this for the lambda to work',
      },
    ],
    true
  );

  /*
    Add in SSM permissions for the lambda function
    */
  if (lambdaRequirements.needsSsmParametersAccess) {
    lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:parameter${path.join(SSM_SCHEMA_ROOT, '/*')}`,
        ],
      })
    );
  }

  /*
    For the schema validation lambdas we need to give them the access to the schema
    */
  if (lambdaRequirements.needsSchemaRegistryAccess) {
    // Add the schema registry access to the lambda function
    lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['schemas:DescribeRegistry', 'schemas:DescribeSchema'],
        resources: [
          `arn:aws:schemas:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:registry/${SCHEMA_REGISTRY_NAME}`,
          `arn:aws:schemas:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:schema/${path.join(SCHEMA_REGISTRY_NAME, '/*')}`,
        ],
      })
    );

    /* Since we dont ask which schema, we give the lambda access to all schemas in the registry */
    /* As such we need to add the wildcard to the resource */
    NagSuppressions.addResourceSuppressions(
      lambdaFunction,
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'We need to give the lambda access to all schemas in the registry',
        },
      ],
      true
    );
  }

  /*
    External bucket info, required by the post schema validation lambda to confirm inputs
    are legitimate
  */
  if (lambdaRequirements.needsExternalBucketInfo) {
    lambdaFunction.addEnvironment('TEST_DATA_BUCKET_NAME', TEST_DATA_BUCKET_NAME);
  }

  /*
    Needs workflow name environment variable
  */
  if (lambdaRequirements.needsWorkflowNameEnvVar) {
    lambdaFunction.addEnvironment('WORKFLOW_NAME', WORKFLOW_NAME);
  }

  /*
    Special if the lambdaName is 'validateDraftCompleteSchema', we need to add in the ssm parameters
    to the REGISTRY_NAME and SCHEMA_NAME
   */
  if (props.lambdaName === 'validateDraftPayload') {
    const draftSchemaName: SchemaNames = 'completeDataDraft';
    lambdaFunction.addEnvironment('SSM_REGISTRY_NAME', path.join(SSM_SCHEMA_ROOT, 'registry'));
    lambdaFunction.addEnvironment(
      'SSM_SCHEMA_NAME',
      path.join(SSM_SCHEMA_ROOT, camelCaseToKebabCase(draftSchemaName), 'latest')
    );
  }

  /* Return the function */
  return {
    lambdaName: props.lambdaName,
    lambdaFunction: lambdaFunction,
  };
}

export function buildAllLambdas(scope: Construct): LambdaObject[] {
  // Iterate over lambdaLayerToMapping and create the lambda functions
  const lambdaObjects: LambdaObject[] = [];
  for (const lambdaName of lambdaNamesList) {
    lambdaObjects.push(
      buildLambda(scope, {
        lambdaName: lambdaName,
      })
    );
  }

  return lambdaObjects;
}

export function getLambdaResourceLogicalArn(lambdaFunction: lambda.Function): string | null {
  // Find L1 CloudFormation CfnFunction resource(s) under the L2 Function (exclude Alias/Version L1s)
  const cfnFunctions = lambdaFunction.node
    .findAll()
    .filter((n) => n instanceof lambda.CfnFunction) as lambda.CfnFunction[];

  // Use the first CfnFunction's logical ID
  if (cfnFunctions.length > 0) {
    const logicalId = cdk.Stack.of(lambdaFunction).getLogicalId(cfnFunctions[0]);
    return `Resource::<${logicalId}.Arn>:*`;
  }

  return null;
}
