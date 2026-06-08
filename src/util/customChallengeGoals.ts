import tr from '@i18n';
import Event from '../state/State/Challenge/Event';
import Dict from './objectOps/Dict';
import { ConditionGoalInput, sanitizeChallengeEventId } from './customChallengePredicates';
import LocalizedString from './LocalizedString';
import { JBC_CATALOG_EVENTS } from './jbcChallengeCatalog';
import {
  isPlayAreaSuccessEventId,
  playAreaEventDefinition,
  playAreaSuccessEventId,
  PlayAreaSuccessGoalKind,
} from './playAreaSuccessGoals';

const PLAY_AREA_OPPOSITE: Record<PlayAreaSuccessGoalKind, PlayAreaSuccessGoalKind> = {
  robotIntersecting: 'robotNotIntersecting',
  robotNotIntersecting: 'robotIntersecting',
  anyItemIntersecting: 'anyItemNotIntersecting',
  anyItemNotIntersecting: 'anyItemIntersecting',
};

const PLAY_AREA_KIND_FROM_EVENT =
  /^pz_(.+)_(robotIntersecting|robotNotIntersecting|anyItemIntersecting|anyItemNotIntersecting)$/;

export const CAN_CUSTOM_EVENT =
  /^can(\d+)(KnockedOver|NotKnockedOver|Upright|NeverTouched|Touched)$/i;

export const REAM_CUSTOM_EVENT =
  /^ream([a-z0-9]+)(StopNear|Touched)$/i;

/** Catalog-style ids (e.g. canANotUpright, can9NotUpright). */
export const CAN_CATALOG_POSE_EVENT =
  /^can([a-z0-9]+)(?:KnockedOver|NotKnockedOver|NotUpright|Notupright|Upright)$/i;

export function customChallengeEventDefinition(eventId: string, label: string): Event {
  return {
    name: { [LocalizedString.EN_US]: label },
    description: { [LocalizedString.EN_US]: label },
  };
}

export function isCustomChallengeItemEventId(eventId: string): boolean {
  return CAN_CUSTOM_EVENT.test(eventId) || REAM_CUSTOM_EVENT.test(eventId);
}

/** Mat-item pose events (knock-over, upright, touch) from the custom runtime. */
export function isCustomCanPoseChallengeEventId(eventId: string): boolean {
  const base = eventId.replace(/Once$/, '');
  return (
    CAN_CUSTOM_EVENT.test(base) ||
    CAN_CATALOG_POSE_EVENT.test(base) ||
    REAM_CUSTOM_EVENT.test(base)
  );
}

/** Strip auto-generated failure phrases so friendly labels are idempotent. */
function stripFriendlyFailurePhrases_(label: string): string {
  let s = label.trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const pattern of [
      /\s+is still standing$/i,
      /\s+was knocked over$/i,
      /^Robot never touched\s+/i,
      /^Robot touched\s+/i,
    ]) {
      const next = s.replace(pattern, '').trim();
      if (next !== s) {
        s = next;
        changed = true;
      }
    }
  }
  return s;
}

function displayNameFromCanNodeId_(nodeId: string): string {
  const match = /^can(\d+)$/i.exec(nodeId);
  if (match) return `Can ${match[1]}`;
  return nodeId;
}

function displayNameFromReamNodeId_(nodeId: string): string {
  const match = /^ream(\d+)$/i.exec(nodeId);
  if (match) return `Ream ${match[1]}`;
  return nodeId;
}

function itemNameForCanFailureEvent_(goal: ConditionGoalInput, eventSuffix: string): string {
  const fromLabel = stripFriendlyFailurePhrases_(goal.label.split(':')[0]?.trim() ?? '');
  if (fromLabel) return fromLabel;
  const stem = goal.eventId.replace(new RegExp(`${eventSuffix}$`, 'i'), '');
  return displayNameFromCanNodeId_(stem);
}

function itemNameForReamFailureEvent_(goal: ConditionGoalInput, eventSuffix: string): string {
  const fromLabel = stripFriendlyFailurePhrases_(goal.label.split(':')[0]?.trim() ?? '');
  if (fromLabel) return fromLabel;
  const stem = goal.eventId.replace(new RegExp(`${eventSuffix}$`, 'i'), '');
  return displayNameFromReamNodeId_(stem);
}

/** Failure is the logical opposite of a success rule. */
export function oppositeFailureGoal(success: ConditionGoalInput): ConditionGoalInput | null {
  const playAreaMatch = PLAY_AREA_KIND_FROM_EVENT.exec(success.eventId);
  if (playAreaMatch) {
    const zoneId = playAreaMatch[1];
    const kind = playAreaMatch[2] as PlayAreaSuccessGoalKind;
    const oppositeKind = PLAY_AREA_OPPOSITE[kind];
    const zoneLabel = success.label.split(':')[0]?.trim() ?? 'Play area';
    return {
      eventId: playAreaSuccessEventId(zoneId, oppositeKind),
      label: failureLabelForPlayAreaKind_(zoneLabel, oppositeKind),
      // Latch like built-in JBC failures (e.g. offMatOnce): leave/enter edges are one frame.
      latchOnce: true,
    };
  }

  const knocked = /^can([a-z0-9]+)KnockedOver$/i.exec(success.eventId);
  if (knocked) {
    const nodeId = /^can/i.test(knocked[1]) ? knocked[1] : `can${knocked[1]}`;
    const name =
      stripFriendlyFailurePhrases_(success.label.split(':')[0]?.trim() ?? '') ||
      displayNameFromCanNodeId_(nodeId);
    return {
      eventId: sanitizeChallengeEventId(`${nodeId}NotKnockedOver`),
      label: String(
        LocalizedString.lookup(
          tr('{name} is still standing'),
          LocalizedString.EN_US
        )
      ).replace('{name}', name),
      latchOnce: false,
    };
  }

  const upright = /^can(\d+)Upright$/i.exec(success.eventId);
  if (upright && !success.eventId.includes('Not')) {
    const nodeId = `can${upright[1]}`;
    const name =
      stripFriendlyFailurePhrases_(success.label.split(':')[0]?.trim() ?? '') ||
      displayNameFromCanNodeId_(nodeId);
    return {
      eventId: sanitizeChallengeEventId(`${nodeId}KnockedOver`),
      label: String(
        LocalizedString.lookup(
          tr('{name} was knocked over'),
          LocalizedString.EN_US
        )
      ).replace('{name}', name),
      latchOnce: false,
    };
  }

  const stopNear = /^(ream[a-z0-9]+)StopNear$/i.exec(success.eventId);
  if (stopNear) {
    const nodeId = stopNear[1];
    const name =
      stripFriendlyFailurePhrases_(success.label.split(':')[0]?.trim() ?? '') ||
      displayNameFromReamNodeId_(nodeId);
    return {
      eventId: sanitizeChallengeEventId(`${nodeId}Touched`),
      label: String(
        LocalizedString.lookup(
          tr('Robot touched {name}'),
          LocalizedString.EN_US
        )
      ).replace('{name}', name),
      latchOnce: true,
    };
  }

  const touchMatch =
    (/^(can\d+)Touched$/i.exec(success.eventId)) ||
    (/^(can\d+)Reached$/i.exec(success.eventId));
  if (touchMatch) {
    const nodeId = touchMatch[1];
    const name =
      stripFriendlyFailurePhrases_(success.label.split(':')[0]?.trim() ?? '') ||
      displayNameFromCanNodeId_(nodeId);
    return {
      eventId: sanitizeChallengeEventId(`${nodeId}NeverTouched`),
      label: String(
        LocalizedString.lookup(
          tr('Robot never touched {name}'),
          LocalizedString.EN_US
        )
      ).replace('{name}', name),
      latchOnce: false,
    };
  }

  return null;
}

function failureLabelForPlayAreaKind_(
  zoneName: string,
  kind: PlayAreaSuccessGoalKind
): string {
  switch (kind) {
    case 'robotIntersecting':
      return `${zoneName}: ${String(
        LocalizedString.lookup(
          tr('Robot enters this area'),
          LocalizedString.EN_US
        )
      )}`;
    case 'robotNotIntersecting':
      return `${zoneName}: ${String(
        LocalizedString.lookup(
          tr('Robot leaves this area'),
          LocalizedString.EN_US
        )
      )}`;
    case 'anyItemIntersecting':
      return `${zoneName}: ${String(
        LocalizedString.lookup(
          tr('A mat item enters this area'),
          LocalizedString.EN_US
        )
      )}`;
    case 'anyItemNotIntersecting':
      return `${zoneName}: ${String(
        LocalizedString.lookup(
          tr('No mat item is in this area'),
          LocalizedString.EN_US
        )
      )}`;
    default:
      return `${zoneName}: failure`;
  }
}

/** Plain-language labels for auto-generated and catalog failure rules. */
export function friendlyFailureGoalLabel(goal: ConditionGoalInput): string {
  const playAreaMatch = PLAY_AREA_KIND_FROM_EVENT.exec(goal.eventId);
  if (playAreaMatch) {
    const zoneName = goal.label.split(':')[0]?.trim() || 'Play area';
    return failureLabelForPlayAreaKind_(
      zoneName,
      playAreaMatch[2] as PlayAreaSuccessGoalKind
    );
  }

  if (/NotKnockedOver$/i.test(goal.eventId)) {
    const item = itemNameForCanFailureEvent_(goal, 'NotKnockedOver');
    return String(
      LocalizedString.lookup(tr('{name} is still standing'), LocalizedString.EN_US)
    ).replace('{name}', item);
  }
  if (/KnockedOver$/i.test(goal.eventId) && !/NotKnockedOver/i.test(goal.eventId)) {
    const item = itemNameForCanFailureEvent_(goal, 'KnockedOver');
    return String(
      LocalizedString.lookup(tr('{name} was knocked over'), LocalizedString.EN_US)
    ).replace('{name}', item);
  }
  if (/NeverTouched$/i.test(goal.eventId)) {
    const item = itemNameForCanFailureEvent_(goal, 'NeverTouched');
    return String(
      LocalizedString.lookup(tr('Robot never touched {name}'), LocalizedString.EN_US)
    ).replace('{name}', item);
  }
  if (/^ream[a-z0-9]+Touched$/i.test(goal.eventId)) {
    const item = itemNameForReamFailureEvent_(goal, 'Touched');
    return String(
      LocalizedString.lookup(tr('Robot touched {name}'), LocalizedString.EN_US)
    ).replace('{name}', item);
  }

  return goal.label.replace(/\s*\(fail\)\s*/gi, '').trim();
}

export function friendlyFailureGoals(
  goals: ConditionGoalInput[]
): ConditionGoalInput[] {
  return goals.map(goal => ({
    ...goal,
    label: friendlyFailureGoalLabel(goal),
  }));
}

/** Touch/reach success goals paired with an active "never touched" failure row. */
export function touchSuccessNeverTouchedPairs(
  successGoals: ConditionGoalInput[],
  failureGoals: ConditionGoalInput[]
): Array<{ touched: string; never: string }> {
  const failureIds = new Set(failureGoals.map(g => g.eventId));
  const pairs: Array<{ touched: string; never: string }> = [];
  for (const success of successGoals) {
    if (
      !/Touched$/i.test(success.eventId) &&
      !/Reached$/i.test(success.eventId)
    ) {
      continue;
    }
    const opposite = oppositeFailureGoal(success);
    if (!opposite || !/NeverTouched$/i.test(opposite.eventId)) continue;
    if (!failureIds.has(opposite.eventId)) continue;
    pairs.push({ touched: success.eventId, never: opposite.eventId });
  }
  return pairs;
}

/** "Can stays upright" success goals (canXUpright, not NotKnockedOver / failure rows). */
export function stayUprightSuccessGoals(
  successGoals: ConditionGoalInput[]
): Array<{ eventId: string; nodeId: string }> {
  const out: Array<{ eventId: string; nodeId: string }> = [];
  for (const goal of successGoals) {
    const match = /^(can[a-z0-9]+)Upright$/i.exec(goal.eventId);
    if (!match || /Not/i.test(goal.eventId)) continue;
    out.push({ eventId: goal.eventId, nodeId: match[1] });
  }
  return out;
}

export function buildOppositeFailureGoals(
  successGoals: ConditionGoalInput[]
): ConditionGoalInput[] {
  const failures: ConditionGoalInput[] = [];
  for (const goal of successGoals) {
    const opposite = oppositeFailureGoal(goal);
    if (!opposite) continue;
    if (failures.some(f => f.eventId === opposite.eventId)) continue;
    failures.push(opposite);
  }
  return failures;
}

/** Event ids generated by the custom-challenge wizard (not arbitrary user-defined ids). */
export function isManagedCustomChallengeEventId(eventId: string): boolean {
  if (isPlayAreaSuccessEventId(eventId) || isCustomChallengeItemEventId(eventId)) {
    return true;
  }
  return JBC_CATALOG_EVENTS.some(entry => entry.eventId === eventId);
}

/** Ensure every goal has a matching event definition; preserve existing entries. */
export function mergeEventsForConditionGoals(
  events: Dict<Event>,
  goals: ConditionGoalInput[]
): Dict<Event> {
  const next = { ...events };
  for (const goal of goals) {
    if (next[goal.eventId]) continue;
    if (isPlayAreaSuccessEventId(goal.eventId)) {
      next[goal.eventId] = playAreaEventDefinition(goal.eventId, goal.label);
      continue;
    }
    if (isCustomChallengeItemEventId(goal.eventId)) {
      next[goal.eventId] = customChallengeEventDefinition(goal.eventId, goal.label);
      continue;
    }
    const catalogEvent = JBC_CATALOG_EVENTS.find(e => e.eventId === goal.eventId);
    if (catalogEvent) {
      next[goal.eventId] = JSON.parse(JSON.stringify(catalogEvent.event)) as Event;
    }
  }
  return next;
}

/** Drop events that no goal references, then merge definitions for remaining goals. */
export function pruneEventsToConditionGoals(
  events: Dict<Event>,
  goals: ConditionGoalInput[]
): Dict<Event> {
  const requiredIds = new Set(goals.map(goal => goal.eventId));
  const pruned: Dict<Event> = {};
  for (const eventId of requiredIds) {
    if (events[eventId]) {
      pruned[eventId] = events[eventId];
    }
  }
  return mergeEventsForConditionGoals(pruned, goals);
}
