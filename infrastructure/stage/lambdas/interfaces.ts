import { PythonUvFunction } from '@orcabus/platform-cdk-constructs/lambda';

export type LambdaName =
  // Pre-Draft Complete lambda functions
  | 'getLibraries'
  | 'getMetadataTags'
  | 'getProjectBaseUriFromProjectId'
  | 'getFastqIdListFromFastqRgidList'
  | 'getFastqListRgidsFromLibrary'
  | 'getFastqListRowsFromFastqRgidList'
  | 'checkNtsmInternalPassing'
  | 'comparePayload'
  | 'generateWruEventObjectWithMergedData'
  | 'getWorkflowRunObject'
  | 'getQcSummaryStatsFromRgidList'
  // Validation functions
  | 'validateDraftPayload'
  | 'postSchemaValidation'
  // Ready-to-ICAv2 WES Request lambda functions
  | 'addReadyDelayComment'
  | 'getInstrumentRunIdFromFastqId'
  | 'generateMinimalSamplesheetFromFastqIdList'
  | 'uploadSamplesheetToCacheDirectory'
  // Post submission
  | 'addWesFailureComment'
  | 'convertIcav2WesToWrscEvent'
  | 'checkSampleHasSucceeded'
  | 'deleteCacheUri'
  | 'findVcfFiles'
  | 'addPortalRunIdAttributes'
  | 'syncFilemanager';

export const lambdaNamesList: LambdaName[] = [
  // Pre-Draft Complete lambda functions
  'getLibraries',
  'getMetadataTags',
  'getProjectBaseUriFromProjectId',
  'getFastqIdListFromFastqRgidList',
  'getFastqListRgidsFromLibrary',
  'getFastqListRowsFromFastqRgidList',
  'checkNtsmInternalPassing',
  'comparePayload',
  'generateWruEventObjectWithMergedData',
  'getWorkflowRunObject',
  'getQcSummaryStatsFromRgidList',
  // Validation functions
  'validateDraftPayload',
  'postSchemaValidation',
  // Ready-to-ICAv2 WES Request lambda functions
  'addReadyDelayComment',
  'getInstrumentRunIdFromFastqId',
  'generateMinimalSamplesheetFromFastqIdList',
  'uploadSamplesheetToCacheDirectory',
  // Post submission
  'addWesFailureComment',
  'convertIcav2WesToWrscEvent',
  'checkSampleHasSucceeded',
  'deleteCacheUri',
  'findVcfFiles',
  'addPortalRunIdAttributes',
  'syncFilemanager',
];

export interface LambdaRequirements {
  needsOrcabusApiToolsLayer?: boolean;
  needsIcav2ToolsLayer?: boolean;
  needsSchemaRegistryAccess?: boolean;
  needsSsmParametersAccess?: boolean;
  needsExternalBucketInfo?: boolean;
}

// Lambda requirements mapping
export const lambdaRequirementsMap: Record<LambdaName, LambdaRequirements> = {
  // Pre-Draft Complete lambda functions
  getLibraries: {
    needsOrcabusApiToolsLayer: true,
  },
  getMetadataTags: {
    needsOrcabusApiToolsLayer: true,
  },
  getProjectBaseUriFromProjectId: {
    needsIcav2ToolsLayer: true,
    needsOrcabusApiToolsLayer: true,
  },
  getFastqIdListFromFastqRgidList: {
    needsOrcabusApiToolsLayer: true,
  },
  getFastqListRgidsFromLibrary: {
    needsOrcabusApiToolsLayer: true,
  },
  getFastqListRowsFromFastqRgidList: {
    needsOrcabusApiToolsLayer: true,
    needsExternalBucketInfo: true,
  },
  checkNtsmInternalPassing: {
    needsOrcabusApiToolsLayer: true,
  },
  comparePayload: {},
  generateWruEventObjectWithMergedData: {
    needsOrcabusApiToolsLayer: true,
  },
  getWorkflowRunObject: {
    needsOrcabusApiToolsLayer: true,
  },
  getQcSummaryStatsFromRgidList: {
    needsOrcabusApiToolsLayer: true,
  },
  // Validation functions
  validateDraftPayload: {
    needsSchemaRegistryAccess: true,
    needsSsmParametersAccess: true,
  },
  postSchemaValidation: {
    needsIcav2ToolsLayer: true,
    needsOrcabusApiToolsLayer: true,
    needsExternalBucketInfo: true,
  },
  // Ready-to-ICAv2 WES Request lambda functions
  addReadyDelayComment: {
    needsOrcabusApiToolsLayer: true,
  },
  getInstrumentRunIdFromFastqId: {
    needsOrcabusApiToolsLayer: true,
  },
  generateMinimalSamplesheetFromFastqIdList: {
    needsIcav2ToolsLayer: true,
  },
  uploadSamplesheetToCacheDirectory: {
    needsIcav2ToolsLayer: true,
  },
  // Post submission
  addWesFailureComment: {
    needsOrcabusApiToolsLayer: true,
  },
  convertIcav2WesToWrscEvent: {
    needsOrcabusApiToolsLayer: true,
  },
  checkSampleHasSucceeded: {
    needsIcav2ToolsLayer: true,
  },
  deleteCacheUri: {
    needsIcav2ToolsLayer: true,
  },
  findVcfFiles: {
    needsIcav2ToolsLayer: true,
  },
  addPortalRunIdAttributes: {
    needsOrcabusApiToolsLayer: true,
  },
  syncFilemanager: {
    needsOrcabusApiToolsLayer: true,
    needsIcav2ToolsLayer: true,
  },
};

export interface LambdaInput {
  lambdaName: LambdaName;
}

export interface LambdaObject extends LambdaInput {
  lambdaFunction: PythonUvFunction;
}
