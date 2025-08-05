import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { Rule } from 'aws-cdk-lib/aws-events';
import { EventBridgeRuleObject } from '../event-rules/interfaces';
import { StepFunctionObject } from '../step-functions/interfaces';

/**
 * EventBridge Target Interfaces
 */
export type EventBridgeTargetNameList =
  | 'DraftLegacyToCompleteDraftSfnTarget'
  | 'DraftToCompleteDraftSfnTarget'
  | 'DraftLegacyToValidateDraftAndReadySfnTarget'
  | 'DraftToValidateDraftAndReadySfnTarget'
  | 'ReadyLegacyToIcav2WesSubmittedSfnTarget'
  | 'ReadyToIcav2WesSubmittedSfnTarget'
  | 'icav2WascEventToWrscSfnTarget';

export const eventBridgeTargetsNameList: EventBridgeTargetNameList[] = [
  'DraftLegacyToCompleteDraftSfnTarget',
  'DraftToCompleteDraftSfnTarget',
  'DraftLegacyToValidateDraftAndReadySfnTarget',
  'DraftToValidateDraftAndReadySfnTarget',
  'ReadyLegacyToIcav2WesSubmittedSfnTarget',
  'ReadyToIcav2WesSubmittedSfnTarget',
  'icav2WascEventToWrscSfnTarget',
];

export interface AddSfnAsEventBridgeTargetProps {
  stateMachineObj: StateMachine;
  eventBridgeRuleObj: Rule;
}

export interface EventBridgeTargetsProps {
  eventBridgeRuleObjects: EventBridgeRuleObject[];
  stepFunctionObjects: StepFunctionObject[];
}
