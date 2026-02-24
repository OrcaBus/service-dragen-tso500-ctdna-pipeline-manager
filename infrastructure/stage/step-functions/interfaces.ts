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
    'getFastqListRowsFromFastqRgidList',
    'getProjectBaseUriFromProjectId',
    'getLibraries',
    'getQcSummaryStatsFromRgidList',
    'checkNtsmInternalPassing',
    'getWorkflowRunObject',
    'comparePayload',
    'generateWruEventObjectWithMergedData',
  ],
  validateDraftDataAndPutReadyEvent: ['validateDraftPayload', 'postSchemaValidation'],
  readyEventToIcav2WesRequestEvent: [
    'addReadyDelayComment',
    'addUploadFailureComment',
    'determineCompressionType',
    'generateFastqUriByFastqIdMap',
    'generateIcav2DataCopyPayload',
    'getFastqIdListFromFastqRgidList',
    'generateMinimalSamplesheetFromFastqIdList',
    'getInstrumentRunIdFromFastqId',
    'uploadSamplesheetToCacheDirectory',
  ],
  handleIcav2AnalysisStateChangeEvent: [
    'addWesFailureComment',
    'convertIcav2WesToWrscEvent',
    'checkSampleHasSucceeded',
    'deleteCacheUri',
    'findVcfFiles',
    'addPortalRunIdAttributes',
    'syncFilemanager',
  ],
};
