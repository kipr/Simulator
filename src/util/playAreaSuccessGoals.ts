import tr from '@i18n';
import Event from '../state/State/Challenge/Event';
import Expr from '../state/State/Challenge/Expr';
import Predicate from '../state/State/Challenge/Predicate';
import { JbcCatalogSuccessGoal } from './jbcChallengeCatalog';
import {
  ConditionGoalInput,
  mergeConditionGoals,
  sanitizeChallengeEventId,
} from './customChallengePredicates';
import LocalizedString from './LocalizedString';
import Scene from '../state/State/Scene';
import { MatPlayZone, matPlayZonesFromScene } from './jbcMatPlayArea';

export type PlayAreaSuccessGoalKind =
  | 'robotIntersecting'
  | 'robotNotIntersecting'
  | 'anyItemIntersecting'
  | 'anyItemNotIntersecting';

export const PLAY_AREA_SUCCESS_GOAL_KINDS: PlayAreaSuccessGoalKind[] = [
  'robotIntersecting',
  'robotNotIntersecting',
  'anyItemIntersecting',
  'anyItemNotIntersecting',
];

/** Pairs that cannot both be selected for the same play area. */
export const PLAY_AREA_SUCCESS_EXCLUSIVE_GROUPS: PlayAreaSuccessGoalKind[][] = [
  ['robotIntersecting', 'robotNotIntersecting'],
  ['anyItemIntersecting', 'anyItemNotIntersecting'],
];

const PLAY_AREA_OPPOSITE_KIND: Record<
PlayAreaSuccessGoalKind,
PlayAreaSuccessGoalKind
> = {
  robotIntersecting: 'robotNotIntersecting',
  robotNotIntersecting: 'robotIntersecting',
  anyItemIntersecting: 'anyItemNotIntersecting',
  anyItemNotIntersecting: 'anyItemIntersecting',
};

/** Selected success kinds plus opposites so runtime scripts update failure events. */
export function playAreaRuntimeGoalKinds(
  successGoalKeys: string[]
): PlayAreaSuccessGoalKind[] {
  const selected = sanitizeZoneSuccessGoalKeys(successGoalKeys);
  const kinds = new Set<PlayAreaSuccessGoalKind>();
  for (const kind of selected) {
    kinds.add(kind);
    kinds.add(PLAY_AREA_OPPOSITE_KIND[kind]);
  }
  return PLAY_AREA_SUCCESS_GOAL_KINDS.filter(k => kinds.has(k));
}

const PLAY_AREA_KIND_IN_EVENT_ID =
  /^(robotIntersecting|robotNotIntersecting|anyItemIntersecting|anyItemNotIntersecting)$/;

/** Match play-area success goals from the wizard to a zone (by event id). */
export function playAreaKindsFromGoalsForZone(
  zoneId: string,
  goals: ConditionGoalInput[],
  zoneCount = 1
): PlayAreaSuccessGoalKind[] {
  const kinds: PlayAreaSuccessGoalKind[] = [];
  for (const kind of PLAY_AREA_SUCCESS_GOAL_KINDS) {
    if (goals.some(g => g.eventId === playAreaSuccessEventId(zoneId, kind))) {
      kinds.push(kind);
    }
  }
  if (kinds.length > 0 || zoneCount !== 1) {
    return kinds;
  }
  const fallback = new Set<PlayAreaSuccessGoalKind>();
  for (const goal of goals) {
    if (!isPlayAreaSuccessEventId(goal.eventId)) continue;
    const suffix = goal.eventId.replace(/^pz_.+_/, '');
    const match = PLAY_AREA_KIND_IN_EVENT_ID.exec(suffix);
    if (match) {
      fallback.add(match[1] as PlayAreaSuccessGoalKind);
    }
  }
  return PLAY_AREA_SUCCESS_GOAL_KINDS.filter(k => fallback.has(k));
}

/** Ensure zone.successGoalKeys includes every play-area success goal for that zone. */
export function mergePlayZoneWithSuccessGoals(
  zone: MatPlayZone,
  successGoals: ConditionGoalInput[],
  zoneCount = 1
): MatPlayZone {
  const fromGoals = playAreaKindsFromGoalsForZone(zone.id, successGoals, zoneCount);
  const keys = new Set([
    ...sanitizeZoneSuccessGoalKeys(zone.successGoalKeys),
    ...fromGoals,
  ]);
  return {
    ...zone,
    successGoalKeys: Array.from(keys),
  };
}

export function playZonesForRuntimeScript(
  playZones: MatPlayZone[],
  playAreaChallengeGoals: ConditionGoalInput[]
): MatPlayZone[] {
  const count = playZones.length;
  return playZones.map(zone =>
    mergePlayZoneWithSuccessGoals(zone, playAreaChallengeGoals, count)
  );
}

/** Play-area event ids referenced in challenge success/failure predicates. */
export function playAreaEventGoalsFromPredicates(
  ...predicates: (Predicate | undefined)[]
): ConditionGoalInput[] {
  const goals: ConditionGoalInput[] = [];
  for (const predicate of predicates) {
    if (!predicate) continue;
    for (const expr of Object.values(predicate.exprs)) {
      if (expr.type !== Expr.Type.Event) continue;
      if (!isPlayAreaSuccessEventId(expr.eventId)) continue;
      if (goals.some(g => g.eventId === expr.eventId)) continue;
      goals.push({
        eventId: expr.eventId,
        label: expr.eventId,
        latchOnce: true,
      });
    }
  }
  return goals;
}

/** All play-area goals used to build the auto runtime (zone keys, challenge rows, predicates). */
export function mergePlayAreaGoalsForRuntime(
  scene: Scene,
  options: {
    challengeSuccessGoals?: ConditionGoalInput[];
    challengeFailureGoals?: ConditionGoalInput[];
    successPredicate?: Predicate;
    failurePredicate?: Predicate;
  } = {}
): ConditionGoalInput[] {
  const fromScene = allZoneSuccessGoals(matPlayZonesFromScene(scene));
  const fromSuccess = (options.challengeSuccessGoals ?? []).filter(g =>
    isPlayAreaSuccessEventId(g.eventId)
  );
  const fromPredicates = playAreaEventGoalsFromPredicates(
    options.successPredicate,
    options.failurePredicate
  );
  // Failure play-area events are opposites of success; do not merge them into zone keys.
  return mergeConditionGoals([...fromScene, ...fromSuccess, ...fromPredicates]);
}

/** Kinds to update in the auto runtime script for one zone. */
export function playZoneKindsForRuntime(
  zone: MatPlayZone,
  playAreaChallengeGoals: ConditionGoalInput[],
  zoneCount: number
): PlayAreaSuccessGoalKind[] {
  const mergedZone = mergePlayZoneWithSuccessGoals(zone, playAreaChallengeGoals, zoneCount);
  let kinds = playAreaRuntimeGoalKinds(mergedZone.successGoalKeys);
  if (kinds.length > 0) return kinds;

  const fromGoals = playAreaKindsFromGoalsForZone(zone.id, playAreaChallengeGoals, zoneCount);
  kinds = playAreaRuntimeGoalKinds(fromGoals);
  if (kinds.length > 0) return kinds;

  if (playAreaChallengeGoals.some(g => isPlayAreaSuccessEventId(g.eventId))) {
    return playAreaRuntimeGoalKinds(['robotIntersecting']);
  }
  return [];
}

export function sceneHasPlayAreaChallengeRules(
  scene: Scene,
  playAreaChallengeGoals: ConditionGoalInput[]
): boolean {
  if (!scene.matPlayZones?.length) return false;
  const zones = matPlayZonesFromScene(scene);
  if (zones.some(z => sanitizeZoneSuccessGoalKeys(z.successGoalKeys).length > 0)) {
    return true;
  }
  return playAreaChallengeGoals.some(g => isPlayAreaSuccessEventId(g.eventId));
}

const PICKER_SOURCE = {
  challengeId: 'custom' as const,
  challengeName: 'Play area',
};

function labelForKind_(kind: PlayAreaSuccessGoalKind): string {
  switch (kind) {
    case 'robotIntersecting':
      return String(
        LocalizedString.lookup(
          tr('Robot enters this play area'),
          LocalizedString.EN_US
        )
      );
    case 'robotNotIntersecting':
      return String(
        LocalizedString.lookup(
          tr('Robot leaves this play area'),
          LocalizedString.EN_US
        )
      );
    case 'anyItemIntersecting':
      return String(
        LocalizedString.lookup(
          tr('Any selected item on the mat is intersecting this play area'),
          LocalizedString.EN_US
        )
      );
    case 'anyItemNotIntersecting':
      return String(
        LocalizedString.lookup(
          tr('No selected item on the mat is intersecting this play area'),
          LocalizedString.EN_US
        )
      );
    default:
      return kind;
  }
}

export function isPlayAreaSuccessGoalKind(key: string): key is PlayAreaSuccessGoalKind {
  return (PLAY_AREA_SUCCESS_GOAL_KINDS as string[]).includes(key);
}

export function sanitizeZoneSuccessGoalKeys(keys: string[]): PlayAreaSuccessGoalKind[] {
  return enforceExclusivePlayAreaSuccessKeys(keys.filter(isPlayAreaSuccessGoalKind));
}

/** At most one kind per exclusive pair (later entries win). */
export function enforceExclusivePlayAreaSuccessKeys(
  kinds: PlayAreaSuccessGoalKind[]
): PlayAreaSuccessGoalKind[] {
  const chosen = new Map<number, PlayAreaSuccessGoalKind>();
  const ungrouped: PlayAreaSuccessGoalKind[] = [];

  for (const kind of kinds) {
    const groupIdx = PLAY_AREA_SUCCESS_EXCLUSIVE_GROUPS.findIndex(g => g.includes(kind));
    if (groupIdx < 0) {
      if (!ungrouped.includes(kind)) {
        ungrouped.push(kind);
      }
      continue;
    }
    chosen.set(groupIdx, kind);
  }

  const fromGroups = PLAY_AREA_SUCCESS_EXCLUSIVE_GROUPS.map(
    (_group, idx) => chosen.get(idx)
  ).filter((k): k is PlayAreaSuccessGoalKind => k !== undefined);

  return [...fromGroups, ...ungrouped];
}

const PLAY_AREA_EVENT_ID_RE =
  /^pz_(.+)_(robotIntersecting|robotNotIntersecting|anyItemIntersecting|anyItemNotIntersecting)$/;

/** Parse a play-area challenge event id (with or without a `Once` suffix). */
export function parsePlayAreaEventId(
  eventId: string
): { zoneId: string; kind: PlayAreaSuccessGoalKind } | null {
  const base = eventId.replace(/Once$/, '');
  const match = PLAY_AREA_EVENT_ID_RE.exec(base);
  if (!match) return null;
  return { zoneId: match[1], kind: match[2] as PlayAreaSuccessGoalKind };
}

export function oppositePlayAreaEventId(eventId: string): string | null {
  const parsed = parsePlayAreaEventId(eventId);
  if (!parsed) return null;
  return playAreaSuccessEventId(parsed.zoneId, PLAY_AREA_OPPOSITE_KIND[parsed.kind]);
}

export function playAreaSuccessEventId(
  zoneId: string,
  kind: PlayAreaSuccessGoalKind
): string {
  return sanitizeChallengeEventId(`pz_${zoneId}_${kind}`);
}

export function isPlayAreaSuccessEventId(eventId: string): boolean {
  return /^pz_[a-zA-Z0-9_]+_(robotIntersecting|robotNotIntersecting|anyItemIntersecting|anyItemNotIntersecting)$/.test(
    eventId
  );
}

/** Catalog entries for the play-area success picker (four options only). */
export function playAreaSuccessGoalPickerCatalog(): JbcCatalogSuccessGoal[] {
  return PLAY_AREA_SUCCESS_GOAL_KINDS.map(kind => ({
    key: kind,
    eventId: kind,
    label: labelForKind_(kind),
    latchOnce: true,
    source: PICKER_SOURCE,
  }));
}

export function disabledPlayAreaSuccessKeys(selectedKeys: ReadonlySet<string>): Set<string> {
  const disabled = new Set<string>();
  const selectedKinds = sanitizeZoneSuccessGoalKeys(Array.from(selectedKeys));

  for (const group of PLAY_AREA_SUCCESS_EXCLUSIVE_GROUPS) {
    const picked = group.find(k => selectedKinds.includes(k));
    if (!picked) continue;
    for (const kind of group) {
      if (kind !== picked) {
        disabled.add(kind);
      }
    }
  }
  return disabled;
}

export function playAreaConditionGoal(
  zone: MatPlayZone,
  kind: PlayAreaSuccessGoalKind
): ConditionGoalInput {
  return {
    eventId: playAreaSuccessEventId(zone.id, kind),
    label: `${zone.name}: ${labelForKind_(kind)}`,
    latchOnce: true,
  };
}

export function conditionGoalsFromPlayAreaZone(zone: MatPlayZone): ConditionGoalInput[] {
  return sanitizeZoneSuccessGoalKeys(zone.successGoalKeys).map(kind =>
    playAreaConditionGoal(zone, kind)
  );
}

export function allZoneSuccessGoals(zones: MatPlayZone[]): ConditionGoalInput[] {
  return mergeConditionGoals(zones.flatMap(conditionGoalsFromPlayAreaZone));
}

export function playAreaEventDefinition(eventId: string, label: string): Event {
  return {
    name: { [LocalizedString.EN_US]: label },
    description: {
      [LocalizedString.EN_US]: label,
    },
  };
}
