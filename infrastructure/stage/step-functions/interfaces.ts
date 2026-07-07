import { LambdaNameList, LambdaObject } from '../lambda/interfaces';
import { IEventBus } from 'aws-cdk-lib/aws-events';
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { SsmParameterPaths } from '../ssm/interfaces';
import { EcsFargateTaskConstruct } from '@orcabus/platform-cdk-constructs/ecs';

export type StateMachineName =
  | 'populateDraftData'
  | 'validateDraftDataAndPutReadyEvent'
  | 'readyEventToIcav2WesRequestEvent'
  | 'icav2WesEventToWrscEvent';

export const stateMachineNameList: StateMachineName[] = [
  'populateDraftData',
  'validateDraftDataAndPutReadyEvent',
  'readyEventToIcav2WesRequestEvent',
  'icav2WesEventToWrscEvent',
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
  icav2WesEventToWrscEvent: {
    needsEventPutPermission: true,
    needsTabixRunTaskPermissions: true,
  },
};

export const stepFunctionToLambdasMap: Record<StateMachineName, LambdaNameList[]> = {
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
    'getMissingSchemaFields',
    'addPopulateDraftComment',
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
  icav2WesEventToWrscEvent: [
    'addWesFailureComment',
    'convertIcav2WesToWrscEvent',
    'checkSampleHasSucceeded',
    'deleteCacheUri',
    'findVcfFiles',
    'addPortalRunIdAttributes',
    'syncFilemanager',
  ],
};
