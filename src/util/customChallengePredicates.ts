import Dict from './objectOps/Dict';
import Expr from '../state/State/Challenge/Expr';
import Predicate from '../state/State/Challenge/Predicate';
import { Goal } from '../state/State/Challenge';
import LocalizedString from './LocalizedString';

/** User-facing row when defining success or failure rules. */
export interface ConditionGoalInput {
  eventId: string;
  label: string;
  /** When true (default), uses Expr.Type.Once like standard JBC challenges. */
  latchOnce?: boolean;
}

export function sanitizeChallengeEventId(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const sanitized = trimmed.replace(/[^a-zA-Z0-9_]/g, '_');
  if (/^[0-9]/.test(sanitized)) {
    return `evt_${sanitized}`;
  }
  return sanitized;
}

function localizedLabel(label: string): LocalizedString {
  return { [LocalizedString.EN_US]: label };
}

function exprIdForGoal(eventId: string, latchOnce: boolean): string {
  return latchOnce ? `${eventId}Once` : eventId;
}

/**
 * Success: all listed events must be satisfied (AND), each optionally latched with Once.
 * Root expression id is always `completion` (gradebook convention).
 */
export function buildSuccessPredicate(goals: ConditionGoalInput[]): Predicate | undefined {
  if (goals.length === 0) return undefined;

  const exprs: Dict<Expr> = {};
  const andArgIds: string[] = [];

  for (const goal of goals) {
    const latchOnce = goal.latchOnce !== false;
    exprs[goal.eventId] = {
      type: Expr.Type.Event,
      eventId: goal.eventId,
    };
    if (latchOnce) {
      const onceId = `${goal.eventId}Once`;
      exprs[onceId] = {
        type: Expr.Type.Once,
        argId: goal.eventId,
      };
      andArgIds.push(onceId);
    } else {
      andArgIds.push(goal.eventId);
    }
  }

  // Always AND the goal exprs under `completion` so each goal.exprId is evaluated
  // (GoalList highlights when predicateCompletion.exprStates[goal.exprId] is true).
  exprs.completion = {
    type: Expr.Type.And,
    argIds: andArgIds,
  };

  return { exprs, rootId: 'completion' };
}

/**
 * Failure: any listed event triggers failure (OR), each optionally latched with Once.
 * Root expression id is always `failure`.
 */
export function buildFailurePredicate(goals: ConditionGoalInput[]): Predicate | undefined {
  if (goals.length === 0) return undefined;

  const exprs: Dict<Expr> = {};
  const orArgIds: string[] = [];

  for (const goal of goals) {
    const latchOnce = goal.latchOnce !== false;
    exprs[goal.eventId] = {
      type: Expr.Type.Event,
      eventId: goal.eventId,
    };
    if (latchOnce) {
      const onceId = `${goal.eventId}Once`;
      exprs[onceId] = {
        type: Expr.Type.Once,
        argId: goal.eventId,
      };
      orArgIds.push(onceId);
    } else {
      orArgIds.push(goal.eventId);
    }
  }

  // Always OR the goal exprs under `failure` so each goal.exprId is evaluated.
  exprs.failure = {
    type: Expr.Type.Or,
    argIds: orArgIds,
  };

  return { exprs, rootId: 'failure' };
}

export function buildSuccessGoals(goals: ConditionGoalInput[]): Goal[] {
  return goals.map(goal => ({
    exprId: exprIdForGoal(goal.eventId, goal.latchOnce !== false),
    name: localizedLabel(goal.label),
  }));
}

export function buildFailureGoals(goals: ConditionGoalInput[]): Goal[] {
  return goals.map(goal => ({
    exprId: exprIdForGoal(goal.eventId, goal.latchOnce !== false),
    name: localizedLabel(goal.label),
  }));
}

export function mergeConditionGoals(goals: ConditionGoalInput[]): ConditionGoalInput[] {
  const merged: ConditionGoalInput[] = [];
  for (const goal of goals) {
    if (
      merged.some(
        g =>
          g.eventId === goal.eventId &&
          g.label === goal.label &&
          (g.latchOnce !== false) === (goal.latchOnce !== false)
      )
    ) {
      continue;
    }
    merged.push(goal);
  }
  return merged;
}

/** Reverse-engineer editor rows from an existing challenge (best-effort). */
export function conditionGoalsFromChallenge(
  predicate: Predicate | undefined,
  goals: Goal[] | undefined
): ConditionGoalInput[] {
  if (!goals || goals.length === 0) return [];
  return goals.map(goal => ({
    eventId: goal.exprId.replace(/Once$/, ''),
    label: LocalizedString.lookup(goal.name, LocalizedString.EN_US),
    latchOnce: goal.exprId.endsWith('Once'),
  }));
}
