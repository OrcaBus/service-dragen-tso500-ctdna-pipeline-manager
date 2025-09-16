import { LambdaName, LambdaObject } from '../lambdas/interfaces';
import { IEventBus } from 'aws-cdk-lib/aws-events';
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { SsmParameterPaths } from '../ssm/interfaces';
import { EcsFargateTaskConstruct } from '@orcabus/platform-cdk-constructs/ecs';

export type StateMachineName =
  | 'populateDraftData'
  | 'validateDraftDataAndPutReadyEvent'
  | 'readyEventToIcav2WesRequestEvent'
  | 'handleIcav2AnalysisStateChangeEvent';

export const stateMachineNameList: StateMachineName[] = [
  'populateDraftData',
  'validateDraftDataAndPutReadyEvent',
  'readyEventToIcav2WesRequestEvent',
  'handleIcav2AnalysisStateChangeEvent',
];

export interface StepFunctionRequirements {
  // Event stuff
  needsEventPutPermission?: boolean;

  // SSM Stuff
  needsSsmParameterStoreAccess?: boolean;

  // ECS Stuff
  needsTabixRunTaskPermissions?: boolean;
}

export interface StepFunctionInput {
  stateMachineName: StateMachineName;
}

export interface BuildStepFunctionProps extends StepFunctionInput {
  lambdaObjects: LambdaObject[];
  eventBus: IEventBus;
  ssmParameterPaths: SsmParameterPaths;
  fargateTabixTaskObj: EcsFargateTaskConstruct;
  // Workflow management
  isNewWorkflowManagementEnabled: boolean;
}

export interface StepFunctionObject extends StepFunctionInput {
  sfnObject: StateMachine;
}

export type WireUpPermissionsProps = BuildStepFunctionProps & StepFunctionObject;

export type BuildStepFunctionsProps = Omit<BuildStepFunctionProps, 'stateMachineName'>;

export const stepFunctionsRequirementsMap: Record<StateMachineName, StepFunctionRequirements> = {
  populateDraftData: {
    needsEventPutPermission: true,
    needsSsmParameterStoreAccess: true,
  },
  validateDraftDataAndPutReadyEvent: {
    needsEventPutPermission: true,
  },
  readyEventToIcav2WesRequestEvent: {
    needsEventPutPermission: true,
  },
  handleIcav2AnalysisStateChangeEvent: {
    needsEventPutPermission: true,
    needsTabixRunTaskPermissions: true,
  },
};

export const stepFunctionToLambdasMap: Record<StateMachineName, LambdaName[]> = {
  populateDraftData: [
    'validateDraftPayload',
    'getFastqListRgidsFromLibrary',
    'getMetadataTags',
    'getFastqIdListFromFastqRgidList',
    'getFastqListRowsFromFastqIdList',
    'getLibraries',
    'getQcSummaryStatsFromRgidList',
    'checkNtsmInternalPassing',
    'getWorkflowRunObject',
    'comparePayload',
    'generateWruEventObjectWithMergedData',
  ],
  validateDraftDataAndPutReadyEvent: ['validateDraftPayload'],
  readyEventToIcav2WesRequestEvent: [
    'getFastqIdListFromFastqRgidList',
    'generateMinimalSamplesheetFromFastqIdList',
    'getInstrumentRunIdFromFastqId',
    'uploadSamplesheetToCacheDirectory',
  ],
  handleIcav2AnalysisStateChangeEvent: [
    'convertIcav2WesToWrscEvent',
    'checkSampleHasSucceeded',
    'deleteCacheUri',
    'findVcfFiles',
  ],
};
