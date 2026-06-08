import Dict from './objectOps/Dict';
import Expr from '../state/State/Challenge/Expr';
import { Goal } from '../state/State/Challenge';
import Predicate from '../state/State/Challenge/Predicate';
import PredicateCompletion from '../state/State/ChallengeCompletion/PredicateCompletion';
import {
  conditionGoalsFromChallenge,
  ConditionGoalInput,
} from './customChallengePredicates';
import { oppositeFailureGoal } from './customChallengeGoals';
import { isPlayAreaSuccessEventId } from './playAreaSuccessGoals';

function failurePredicateEventIds_(failure?: Predicate): Set<string> {
  const ids = new Set<string>();
  if (!failure) return ids;
  for (const expr of Dict.values(failure.exprs)) {
    if (expr.type === Expr.Type.Event) {
      ids.add(expr.eventId);
    }
  }
  return ids;
}

function clearOnceLatchForEvent_(
  success: Predicate | undefined,
  exprStates: Dict<boolean>,
  eventId: string
): Dict<boolean> {
  if (!success) return exprStates;
  const next = { ...exprStates };
  for (const [exprId, expr] of Object.entries(success.exprs)) {
    if (expr.type === Expr.Type.Once && expr.argId === eventId) {
      delete next[exprId];
    }
  }
  return next;
}

function successEventsToClearOnFailure_(
  failureEventId: string,
  successGoals: ConditionGoalInput[]
): string[] {
  const cleared: string[] = [];
  for (const success of successGoals) {
    const opposite = oppositeFailureGoal(success);
    if (opposite?.eventId === failureEventId) {
      cleared.push(success.eventId);
    }
  }
  return cleared;
}

export interface ChallengeEventUpdateInput {
  success?: Predicate;
  failure?: Predicate;
  successGoals?: Goal[];
  eventStates: Dict<boolean>;
  successCompletion?: PredicateCompletion;
  failureCompletion?: PredicateCompletion;
}

export interface ChallengeEventUpdateResult {
  eventStates: Dict<boolean>;
  successCompletion?: PredicateCompletion;
  failureCompletion?: PredicateCompletion;
}

/** Apply a scene script event update and reset paired success when a failure event fires. */
export function applyChallengeEventValueChange(
  eventId: string,
  value: boolean,
  challenge: ChallengeEventUpdateInput
): ChallengeEventUpdateResult {
  const eventStates: Dict<boolean> = {
    ...challenge.eventStates,
    [eventId]: value,
  };

  let successExprStates = challenge.successCompletion?.exprStates ?? {};

  // Knock-over success clears the paired "still standing" failure event.
  if (
    value === true &&
    /KnockedOver$/i.test(eventId) &&
    !/NotKnockedOver/i.test(eventId)
  ) {
    const stillStandingId = eventId.replace(/KnockedOver$/i, 'NotKnockedOver');
    if (stillStandingId !== eventId) {
      eventStates[stillStandingId] = false;
    }
  }

  // Touch/reach success clears the paired "never touched" failure event.
  if (
    value === true &&
    (/Touched$/i.test(eventId) || /Reached$/i.test(eventId)) &&
    !/NeverTouched/i.test(eventId)
  ) {
    const neverTouchedId = eventId.replace(
      /(Touched|Reached)$/i,
      'NeverTouched'
    );
    if (neverTouchedId !== eventId) {
      eventStates[neverTouchedId] = false;
    }
  }

  // Stop-near success clears the paired "touched ream" failure event.
  if (value === true && /StopNear$/i.test(eventId)) {
    const touchedId = eventId.replace(/StopNear$/i, 'Touched');
    if (touchedId !== eventId) {
      eventStates[touchedId] = false;
    }
  }

  // Upright success clears the paired knock-over failure event.
  if (
    value === true &&
    /Upright$/i.test(eventId) &&
    !/Not/i.test(eventId)
  ) {
    const knockedId = eventId.replace(/Upright$/i, 'KnockedOver');
    if (knockedId !== eventId) {
      eventStates[knockedId] = false;
    }
  }

  if (value === true && challenge.failure) {
    const failureIds = failurePredicateEventIds_(challenge.failure);
    // "Still standing" is true while the can starts upright — do not clear knock-over progress.
    if (failureIds.has(eventId) && !/NotKnockedOver$/i.test(eventId)) {
      const successGoals = conditionGoalsFromChallenge(
        challenge.success,
        challenge.successGoals
      );
      for (const clearId of successEventsToClearOnFailure_(eventId, successGoals)) {
        // Play-area enter/leave can flicker for a frame; do not clear latched success.
        if (isPlayAreaSuccessEventId(clearId)) continue;
        eventStates[clearId] = false;
        successExprStates = clearOnceLatchForEvent_(
          challenge.success,
          successExprStates,
          clearId
        );
      }
    }
  }

  const successCompletion = challenge.success
    ? PredicateCompletion.update(
      { exprStates: successExprStates },
      challenge.success,
      eventStates
    )
    : undefined;

  const failureCompletion = challenge.failure
    ? PredicateCompletion.update(
      challenge.failureCompletion ?? PredicateCompletion.EMPTY,
      challenge.failure,
      eventStates
    )
    : undefined;

  return {
    eventStates,
    successCompletion,
    failureCompletion,
  };
}
