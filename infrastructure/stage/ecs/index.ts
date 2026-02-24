/*
Build the ecs fargate task
*/

import { Construct } from 'constructs';
import {
  CPU_ARCHITECTURE_MAP,
  EcsFargateTaskConstruct,
  FargateEcsTaskConstructProps,
} from '@orcabus/platform-cdk-constructs/ecs';
import * as path from 'path';
import { ECS_DIR } from '../constants';
import { BuildTabixFargateEcsProps } from './interfaces';
import { NagSuppressions } from 'cdk-nag';
import { ICAV2_BASE_URL } from '@orcabus/platform-cdk-constructs/shared-config/icav2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';

function buildEcsFargateTask(scope: Construct, id: string, props: FargateEcsTaskConstructProps) {
  /*
    Generate an ECS Fargate task construct with the provided properties.
    */
  return new EcsFargateTaskConstruct(scope, id, props);
}

export function buildTabixFargateTask(
  scope: Construct,
  props: BuildTabixFargateEcsProps
): EcsFargateTaskConstruct {
  /*
    Build the Tabix.

    We use a mere 1 CPUs for this task, it is a feeble task that should probably be a lambda.
    Unfortunately it cannot be a simple python lambda due to the need for the libgomp1 library.
    So we build it out as a fargate task instead. This also means that if for some reason we
    need to start compressing up gVCFs, we have a task that can handle it.
    */

  const ecsTask = buildEcsFargateTask(scope, 'TabixFargateTask', {
    containerName: 'tabix-task',
    dockerPath: path.join(ECS_DIR, 'tabix'),
    nCpus: 1, // 1 CPUs
    memoryLimitGiB: 2, // 2 GB of memory (minimum for 1 CPUs)
    architecture: 'ARM64',
    runtimePlatform: CPU_ARCHITECTURE_MAP['ARM64'],
  });

  // Needs access to the secrets manager
  props.icav2AccessTokenSecretObj.grantRead(ecsTask.taskDefinition.taskRole);

  // Add the ICAv2 ACCESS TOKEN secret id to the task definition
  ecsTask.containerDefinition.addEnvironment(
    'ICAV2_ACCESS_TOKEN_SECRET_ID',
    props.icav2AccessTokenSecretObj.secretName
  );
  ecsTask.containerDefinition.addEnvironment('ICAV2_BASE_URL', ICAV2_BASE_URL);

  // Add the following environment variables to the task definition:
  // ICAV2_STORAGE_CONFIGURATION_SSM_PARAMETER_PATH_PREFIX
  // ICAV2_PROJECT_TO_STORAGE_CONFIGURATION_MAPPING_SSM_PARAMETER_PATH_PREFIX
  // ICAV2_STORAGE_CREDENTIAL_LIST_FILE_SSM_PARAMETER_PATH_PREFIX
  ecsTask.containerDefinition.addEnvironment(
    'ICAV2_STORAGE_CONFIGURATION_SSM_PARAMETER_PATH_PREFIX',
    props.storageConfigurationSsmParameterPathPrefix
  );
  ecsTask.containerDefinition.addEnvironment(
    'ICAV2_PROJECT_TO_STORAGE_CONFIGURATION_MAPPING_SSM_PARAMETER_PATH_PREFIX',
    props.projectToStorageConfigurationsSsmParameterPathPrefix
  );
  ecsTask.containerDefinition.addEnvironment(
    'ICAV2_STORAGE_CREDENTIAL_LIST_FILE_SSM_PARAMETER_PATH_PREFIX',
    props.storageCredentialsSsmParameterPathPrefix
  );
  ecsTask.taskDefinition.taskRole.addToPrincipalPolicy(
    new iam.PolicyStatement({
      actions: ['ssm:GetParameter', 'ssm:GetParametersByPath'],
      resources: [
        `arn:aws:ssm:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:parameter${props.storageConfigurationSsmParameterPathPrefix}*`,
        `arn:aws:ssm:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:parameter${props.projectToStorageConfigurationsSsmParameterPathPrefix}*`,
        `arn:aws:ssm:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:parameter${props.storageCredentialsSsmParameterPathPrefix}*`,
      ],
    })
  );

  // Add suppressions for the task role
  // Since the task role needs to access the S3 bucket prefix
  NagSuppressions.addResourceSuppressions(
    [ecsTask.taskDefinition, ecsTask.taskExecutionRole],
    [
      {
        id: 'AwsSolutions-IAM5',
        reason:
          'The task role needs to access the S3 bucket and secrets manager for decompression and metadata storage. ' +
          'We also have ssm parameters to handle',
      },
      {
        id: 'AwsSolutions-IAM4',
        reason:
          'We use the standard ecs task role for this task, which allows the guard duty agent to run alongside the task.',
      },
      {
        id: 'AwsSolutions-ECS2',
        reason:
          'The task is designed to run with some constant environment variables, not sure why this is a bad thing?',
      },
    ],
    true
  );

  return ecsTask;
}
