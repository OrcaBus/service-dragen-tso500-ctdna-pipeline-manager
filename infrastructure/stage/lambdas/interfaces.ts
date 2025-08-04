import { PythonUvFunction } from '@orcabus/platform-cdk-constructs/lambda';

export type LambdaName =
  | 'checkNtsmInternalPassing'
  | 'checkSampleHasSucceeded'
  | 'convertIcav2WesToWrscEvent'
  | 'deleteCacheUri'
  | 'findVcfFiles'
  | 'generateMinimalSamplesheetFromFastqIdList'
  | 'getFastqIdListFromFastqRgidList'
  | 'getFastqListRgidsFromLibrary'
  | 'getFastqListRowsFromFastqIdList'
  | 'getInstrumentRunIdFromFastqId'
  | 'getLibraries'
  | 'getMetadataTags'
  | 'getQcSummaryStatsFromRgidList'
  | 'tabixCompressVcf'
  | 'uploadSamplesheetToCacheDirectory'
  | 'validateDraftPayload';

export const lambdaNamesList: LambdaName[] = [
  'checkNtsmInternalPassing',
  'checkSampleHasSucceeded',
  'convertIcav2WesToWrscEvent',
  'deleteCacheUri',
  'findVcfFiles',
  'generateMinimalSamplesheetFromFastqIdList',
  'getFastqIdListFromFastqRgidList',
  'getFastqListRgidsFromLibrary',
  'getFastqListRowsFromFastqIdList',
  'getInstrumentRunIdFromFastqId',
  'getLibraries',
  'getMetadataTags',
  'getQcSummaryStatsFromRgidList',
  'tabixCompressVcf',
  'uploadSamplesheetToCacheDirectory',
  'validateDraftPayload',
];

export interface LambdaRequirements {
  needsOrcabusApiToolsLayer?: boolean;
  needsIcav2ToolsLayer?: boolean;
  needsSchemaRegistryAccess?: boolean;
  needsSsmParametersAccess?: boolean;
}

// Lambda requirements mapping
export const lambdaRequirementsMap: Record<LambdaName, LambdaRequirements> = {
  checkNtsmInternalPassing: {
    needsOrcabusApiToolsLayer: true,
  },
  checkSampleHasSucceeded: {
    needsIcav2ToolsLayer: true,
  },
  convertIcav2WesToWrscEvent: {
    needsOrcabusApiToolsLayer: true,
  },
  deleteCacheUri: {
    needsIcav2ToolsLayer: true,
  },
  findVcfFiles: {
    needsIcav2ToolsLayer: true,
  },
  generateMinimalSamplesheetFromFastqIdList: {
    needsIcav2ToolsLayer: true,
  },
  getFastqIdListFromFastqRgidList: {
    needsOrcabusApiToolsLayer: true,
  },
  getFastqListRgidsFromLibrary: {
    needsOrcabusApiToolsLayer: true,
  },
  getFastqListRowsFromFastqIdList: {
    needsOrcabusApiToolsLayer: true,
  },
  getInstrumentRunIdFromFastqId: {
    needsOrcabusApiToolsLayer: true,
  },
  getLibraries: {
    needsOrcabusApiToolsLayer: true,
  },
  getMetadataTags: {
    needsOrcabusApiToolsLayer: true,
  },
  getQcSummaryStatsFromRgidList: {
    needsOrcabusApiToolsLayer: true,
  },
  tabixCompressVcf: {
    needsIcav2ToolsLayer: true,
  },
  uploadSamplesheetToCacheDirectory: {
    needsIcav2ToolsLayer: true,
  },
  // Pre-ready-complete lambda functions
  validateDraftPayload: {
    needsSchemaRegistryAccess: true,
    needsSsmParametersAccess: true,
  },
};

export interface LambdaInput {
  lambdaName: LambdaName;
}

export interface LambdaObject extends LambdaInput {
  lambdaFunction: PythonUvFunction;
}
