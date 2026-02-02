import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { Rule } from 'aws-cdk-lib/aws-events';
import { EventBridgeRuleObject } from '../event-rules/interfaces';
import { StepFunctionObject } from '../step-functions/interfaces';

/**
 * EventBridge Target Interfaces
 */
export type EventBridgeTargetNameList =
  // Draft to Completed Draft
  | 'draftToCompleteDraftSfnTarget'
  // Draft to Validate Draft and Ready
  | 'draftToValidateDraftAndReadySfnTarget'
  // Ready to Submitted
  | 'readyToIcav2WesSubmittedSfnTarget'
  // Post submission event conversion
  | 'icav2WascEventToWrscSfnTarget';

export const eventBridgeTargetsNameList: EventBridgeTargetNameList[] = [
  // Draft to Completed Draft
  'draftToCompleteDraftSfnTarget',
  // Draft to Validate Draft and Ready
  'draftToValidateDraftAndReadySfnTarget',
  // Ready to Submitted
  'readyToIcav2WesSubmittedSfnTarget',
  // Post submission event conversion
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
