import { PythonUvFunction } from '@orcabus/platform-cdk-constructs/lambda';

/**
 * Lambda function interface.
 */
export type LambdaNameList =
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
  | 'getMissingSchemaFields'
  | 'getWorkflowRunObject'
  | 'getQcSummaryStatsFromRgidList'
  // Validation functions
  | 'validateDraftPayload'
  | 'postSchemaValidation'
  // Commentary Functions
  | 'addPopulateDraftComment'
  // Ready-to-ICAv2 WES Request lambda functions
  | 'addReadyDelayComment'
  | 'addUploadFailureComment'
  | 'determineCompressionType'
  | 'generateFastqUriByFastqIdMap'
  | 'generateIcav2DataCopyPayload'
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

export const lambdaNameList: LambdaNameList[] = [
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
  'getMissingSchemaFields',
  'getWorkflowRunObject',
  'getQcSummaryStatsFromRgidList',
  // Validation functions
  'validateDraftPayload',
  'postSchemaValidation',
  // Commentary Functions
  'addPopulateDraftComment',
  // Ready-to-ICAv2 WES Request lambda functions
  'addReadyDelayComment',
  'addUploadFailureComment',
  'determineCompressionType',
  'generateFastqUriByFastqIdMap',
  'generateIcav2DataCopyPayload',
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

// Requirements interface for Lambda functions
export interface LambdaRequirements {
  needsOrcabusApiTools?: boolean;
  needsIcav2Tools?: boolean;
  needsHigherMemory?: boolean;
  needsSsmParametersAccess?: boolean;
  needsSchemaRegistryAccess?: boolean;
  needsExternalBucketInfo?: boolean;
  needsWorkflowInfo?: boolean;
  needsRepoUrl?: boolean;
}

// Lambda requirements mapping
export const lambdaRequirementsMap: Record<LambdaNameList, LambdaRequirements> = {
  // Pre-Draft Complete lambda functions
  getLibraries: {
    needsOrcabusApiTools: true,
  },
  getMetadataTags: {
    needsOrcabusApiTools: true,
  },
  getProjectBaseUriFromProjectId: {
    needsIcav2Tools: true,
    needsOrcabusApiTools: true,
  },
  getFastqIdListFromFastqRgidList: {
    needsOrcabusApiTools: true,
  },
  getFastqListRgidsFromLibrary: {
    needsOrcabusApiTools: true,
  },
  getFastqListRowsFromFastqRgidList: {
    needsOrcabusApiTools: true,
    needsExternalBucketInfo: true,
  },
  checkNtsmInternalPassing: {
    needsOrcabusApiTools: true,
  },
  comparePayload: {},
  generateWruEventObjectWithMergedData: {
    needsOrcabusApiTools: true,
  },
  getMissingSchemaFields: {
    needsSchemaRegistryAccess: true,
    needsSsmParametersAccess: true,
  },
  getWorkflowRunObject: {
    needsOrcabusApiTools: true,
  },
  getQcSummaryStatsFromRgidList: {
    needsOrcabusApiTools: true,
  },
  // Validation functions
  validateDraftPayload: {
    needsSchemaRegistryAccess: true,
    needsSsmParametersAccess: true,
    needsOrcabusApiTools: true,
    needsWorkflowInfo: true,
  },
  postSchemaValidation: {
    needsIcav2Tools: true,
    needsOrcabusApiTools: true,
    needsExternalBucketInfo: true,
    needsWorkflowInfo: true,
  },
  // Commentary Functions
  addPopulateDraftComment: {
    needsOrcabusApiTools: true,
    needsWorkflowInfo: true,
    needsRepoUrl: true,
  },
  // Ready-to-ICAv2 WES Request lambda functions
  addReadyDelayComment: {
    needsOrcabusApiTools: true,
    needsWorkflowInfo: true,
  },
  addUploadFailureComment: {
    needsOrcabusApiTools: true,
    needsWorkflowInfo: true,
  },
  determineCompressionType: {
    needsOrcabusApiTools: true,
  },
  generateFastqUriByFastqIdMap: {
    needsOrcabusApiTools: true,
  },
  generateIcav2DataCopyPayload: {
    needsOrcabusApiTools: true,
  },
  getInstrumentRunIdFromFastqId: {
    needsOrcabusApiTools: true,
  },
  generateMinimalSamplesheetFromFastqIdList: {
    needsIcav2Tools: true,
  },
  uploadSamplesheetToCacheDirectory: {
    needsIcav2Tools: true,
  },
  // Post submission
  addWesFailureComment: {
    needsOrcabusApiTools: true,
    needsWorkflowInfo: true,
  },
  convertIcav2WesToWrscEvent: {
    needsOrcabusApiTools: true,
  },
  checkSampleHasSucceeded: {
    needsIcav2Tools: true,
  },
  deleteCacheUri: {
    needsIcav2Tools: true,
  },
  findVcfFiles: {
    needsIcav2Tools: true,
  },
  addPortalRunIdAttributes: {
    needsOrcabusApiTools: true,
  },
  syncFilemanager: {
    needsOrcabusApiTools: true,
    needsIcav2Tools: true,
  },
};

export interface LambdaInput {
  lambdaName: LambdaNameList;
}

export interface LambdaObject extends LambdaInput {
  lambdaFunction: PythonUvFunction;
}
