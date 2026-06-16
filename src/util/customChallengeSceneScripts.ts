import Script from '../state/State/Scene/Script';
import Scene from '../state/State/Scene';
import { nodeUpright } from '../simulator/definitions/scenes/jbcCommonComponents';
import {
  JBC_CATALOG_GEOMETRIES,
  JBC_CATALOG_ITEMS,
  WorldSceneItem,
} from './jbcChallengeCatalog';
import {
  MatPlacementSelection,
  MatPlayZone,
  matPlayAreaRuntimePolygonPoints,
  matPlayZonesFromScene,
  matPlacementFromScene,
} from './jbcMatPlayArea';
import {
  buildItemSuccessWizardSteps,
  conditionGoalsForItemOutcome,
  conditionGoalsFromItemWizardChoices,
  ItemSuccessOutcomeId,
} from './jbcChallengeSuggestions';
import {
  mergePlayAreaGoalsForRuntime,
  playAreaSuccessEventId,
  playZonesForRuntimeScript,
  playZoneKindsForRuntime,
  sceneHasPlayAreaChallengeRules,
  sanitizeZoneSuccessGoalKeys,
} from './playAreaSuccessGoals';
import Predicate from '../state/State/Challenge/Predicate';
import Expr from '../state/State/Challenge/Expr';
import {
  ConditionGoalInput,
  conditionGoalsFromChallenge,
  mergeConditionGoals,
  sanitizeChallengeEventId,
} from './customChallengePredicates';
import { AbstractMesh, TransformNode } from '@babylonjs/core';
import Dict from './objectOps/Dict';
import { referenceOriginFromBabylonNode } from './babylonMath';
import type SceneBinding from '../simulator/babylonBindings/SceneBinding';
import { CAN_CATALOG_POSE_EVENT, CAN_CUSTOM_EVENT } from './customChallengeGoals';
import {
  buildReamStopNearRuntime_,
  collectReamStopNearWatches,
  isReamStopNearSuccessEventId,
  syncReamFrontBoundariesOnScene,
} from './jbcReamStopNear';
export const CUSTOM_CHALLENGE_RUNTIME_SCRIPT_ID = 'customChallengeRuntime';
const RUNTIME_SCRIPT_ID = CUSTOM_CHALLENGE_RUNTIME_SCRIPT_ID;

/** True when this scene uses the auto-generated custom-challenge runtime (not preset JBC scripts). */
export function sceneHasCustomChallengeRuntime(scene: Scene): boolean {
  return !!scene.scripts?.[RUNTIME_SCRIPT_ID];
}

/**
 * Mirror live physics poses into scriptManager.scene before render so preset-style
 * `nodeUpright()` reads tipped cans. Custom challenges only.
 */
export function syncCustomChallengePhysicsPosesIntoScriptScene(
  sceneBinding: SceneBinding,
  configScene: Scene
): void {
  if (!sceneHasCustomChallengeRuntime(configScene)) return;
  const scriptManager = sceneBinding.scriptManager;
  if (scriptManager.programStatus !== 'running') return;

  const robots = Scene.robots(configScene);
  let scriptScene = scriptManager.scene;
  let changed = false;

  for (const nodeId of Dict.keySet(configScene.nodes)) {
    if (nodeId in robots) continue;
    const node = configScene.nodes[nodeId];
    if (!node) continue;

    const bNode = sceneBinding.meshForSceneNodeId(nodeId);
    if (
      !bNode ||
      (!(bNode instanceof AbstractMesh) && !(bNode instanceof TransformNode))
    ) {
      continue;
    }

    const nextOrigin = referenceOriginFromBabylonNode(bNode, node.origin ?? {});
    const prev = scriptScene.nodes[nodeId];
    if (!prev) continue;

    scriptScene = Scene.setNode(scriptScene, nodeId, {
      ...prev,
      origin: nextOrigin,
    });
    changed = true;
  }

  if (changed) {
    scriptManager.scene = scriptScene;
  }
}

function bindRuntimeScriptToRobotNode_(scene: Scene): Scene {
  const robotNode = scene.nodes?.robot;
  if (!robotNode) return scene;
  if (robotNode.scriptIds?.includes(RUNTIME_SCRIPT_ID)) return scene;
  const scriptIds = new Set(robotNode.scriptIds ?? []);
  scriptIds.add(RUNTIME_SCRIPT_ID);
  return Scene.setNode(scene, 'robot', {
    ...robotNode,
    scriptIds: Array.from(scriptIds),
  });
}

function sceneNeedsPlayAreaRuntimeRefresh_(scene: Scene, existing: string): boolean {
  const zones = matPlayZonesFromScene(scene);
  if (zones.length === 0) return false;
  const hasRules = zones.some(
    z => sanitizeZoneSuccessGoalKeys(z.successGoalKeys).length > 0
  );
  if (!hasRules) return false;
  return (
    !existing.includes('PLAY_ZONE_RUNTIME') ||
    /PLAY_ZONE_RUNTIME = \[\s*\];/.test(existing)
  );
}

function nodeIdForPlacementKey_(key: string): string {
  const item = JBC_CATALOG_ITEMS.find(i => i.key === key);
  if (item) return item.nodeId;
  const geom = JBC_CATALOG_GEOMETRIES.find(g => g.key === key);
  return geom?.nodeId ?? key;
}

function escapeJsString_(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export interface CustomChallengeRuntimeScriptInput {
  playZones: MatPlayZone[];
  placement: MatPlacementSelection;
  itemSuccessChoices: Record<string, ItemSuccessOutcomeId>;
  worldItems: WorldSceneItem[];
  /** Play-area goals (zone keys, success/failure rows, predicates) for runtime kind inference. */
  playAreaChallengeGoals?: ConditionGoalInput[];
  /** @deprecated Use playAreaChallengeGoals */
  playAreaSuccessGoals?: ConditionGoalInput[];
  /** Mat-item success/failure rows from the challenge (drives knock-over / touch listeners). */
  challengeSuccessGoals?: ConditionGoalInput[];
  challengeFailureGoals?: ConditionGoalInput[];
  /** Merged item goals (predicate Event exprs + wizard rows); preferred for listeners. */
  itemChallengeGoals?: ConditionGoalInput[];
  /** True while the challenge editor is previewing marker placement. */
  authoringPreview?: boolean;
}

function markerNodeIdsForPlacement_(placement: MatPlacementSelection): string[] {
  return [
    ...new Set(
      placement.geometryKeys
        .map(key => JBC_CATALOG_GEOMETRIES.find(g => g.key === key)?.nodeId)
        .filter((nodeId): nodeId is string => !!nodeId)
    ),
  ];
}

export function customChallengeMarkerNodeIds(scene: Scene): string[] {
  return markerNodeIdsForPlacement_(matPlacementFromScene(scene));
}

/** Invisible marker meshes that must stay enabled for intersection checks (preset JBC behavior). */
export function isCustomChallengeMarkerIntersectionVolume(
  scene: Scene,
  nodeId: string
): boolean {
  if (!sceneHasCustomChallengeRuntime(scene)) return false;
  if (nodeId === 'startBox' || nodeId === 'notStartBox') return true;
  return customChallengeMarkerNodeIds(scene).includes(nodeId);
}

function eventCandidatesForMarkerNode_(nodeId: string): string[] {
  const ids = [
    `${nodeId}Reached`,
    `${nodeId}Inside`,
    `${nodeId}Touched`,
    `${nodeId}Covered`,
    `${nodeId}Intersects`,
    `in${nodeId}`,
  ];

  if (nodeId === 'startBox') {
    ids.push('inStartBox');
  }
  if (nodeId === 'notStartBox') {
    ids.push('notInStartBox');
  }
  if (/line/i.test(nodeId)) {
    ids.push('onLine', 'robotTouchingLine');
  }
  if (nodeId === 'endBox' || nodeId === 'endOfMat') {
    ids.push('reachedEnd', 'offMat');
  }
  if (/garage/i.test(nodeId)) {
    ids.push('inGarage', 'touchGarageLines');
  }

  return ids;
}

export function customChallengeMarkerNodeIdsForEvent(
  scene: Scene,
  eventId: string
): string[] {
  const normalized = sanitizeChallengeEventId(eventId).toLowerCase();
  return customChallengeMarkerNodeIds(scene).filter(nodeId =>
    eventCandidatesForMarkerNode_(nodeId).some(
      candidate => sanitizeChallengeEventId(candidate).toLowerCase() === normalized
    )
  );
}

function setCustomChallengeMarkerNodesVisible_(
  scene: Scene,
  visible: boolean
): Scene {
  let next = scene;
  for (const nodeId of customChallengeMarkerNodeIds(scene)) {
    const node = next.nodes[nodeId];
    if (!node || !('visible' in node) || (node as { visible?: boolean }).visible === visible) {
      continue;
    }
    next = Scene.setNode(next, nodeId, {
      ...node,
      visible,
    } as typeof node);
  }
  return next;
}

function buildChallengeMarkerRuntime_(input: CustomChallengeRuntimeScriptInput): string {
  const markerNodeIds = markerNodeIdsForPlacement_(input.placement);
  const authoringPreview = input.authoringPreview === true;

  return `
// CUSTOM_MARKER_RUNTIME_VISIBILITY
const CUSTOM_CHALLENGE_MARKER_NODE_IDS = ${JSON.stringify(markerNodeIds)};
const CUSTOM_CHALLENGE_MARKER_AUTHORING_PREVIEW = ${JSON.stringify(authoringPreview)};

function customChallengeMarkerEventCandidates_(nodeId) {
  const ids = [
    nodeId + 'Reached',
    nodeId + 'Inside',
    nodeId + 'Touched',
    nodeId + 'Covered',
    nodeId + 'Intersects',
    'in' + nodeId,
  ];
  if (nodeId === 'startBox') ids.push('inStartBox');
  if (nodeId === 'notStartBox') ids.push('notInStartBox');
  if (/line/i.test(nodeId)) ids.push('onLine', 'robotTouchingLine');
  if (nodeId === 'endBox' || nodeId === 'endOfMat') ids.push('reachedEnd', 'offMat');
  if (/garage/i.test(nodeId)) ids.push('inGarage', 'touchGarageLines');
  return ids.map(id => String(id).replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase());
}

function customChallengeMarkerNodeIdsForEvent_(eventId) {
  const normalized = String(eventId).replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  return CUSTOM_CHALLENGE_MARKER_NODE_IDS.filter(nodeId =>
    customChallengeMarkerEventCandidates_(nodeId).includes(normalized)
  );
}

function setCustomChallengeMarkerVisible_(nodeId, visible) {
  if (CUSTOM_CHALLENGE_MARKER_AUTHORING_PREVIEW) return;
  const node = scene.nodes[nodeId];
  if (!node || node.visible === visible) return;
  scene.setNode(nodeId, {
    ...node,
    visible,
  });
}

function setCustomChallengeMarkerVisibleForEvent_(eventId, visible) {
  for (const nodeId of customChallengeMarkerNodeIdsForEvent_(eventId)) {
    setCustomChallengeMarkerVisible_(nodeId, visible);
  }
}

function setAllCustomChallengeMarkersVisible_(visible) {
  for (const nodeId of CUSTOM_CHALLENGE_MARKER_NODE_IDS) {
    setCustomChallengeMarkerVisible_(nodeId, visible);
  }
}

if (!CUSTOM_CHALLENGE_MARKER_AUTHORING_PREVIEW) {
  let customChallengeMarkersWereRunning_ = false;
  scene.addOnRenderListener(() => {
    const running = scene.programStatus === 'running';
    if (!running || !customChallengeMarkersWereRunning_) {
      setAllCustomChallengeMarkersVisible_(false);
    }
    customChallengeMarkersWereRunning_ = running;
  });
}
`;
}

function buildPlayZoneRuntime_(input: CustomChallengeRuntimeScriptInput): string {
  const { playZones, placement } = input;
  const playAreaChallengeGoals =
    input.playAreaChallengeGoals ?? input.playAreaSuccessGoals ?? [];
  if (playZones.length === 0) return '';

  const itemNodeIds = [
    ...placement.worldItemKeys.map(nodeIdForPlacementKey_),
    ...placement.geometryKeys.map(nodeIdForPlacementKey_),
  ];

  const zoneCount = playZones.length;
  const zoneLiterals = playZones
    .map(zone => {
      const points = matPlayAreaRuntimePolygonPoints(zone.shape).map(p => ({
        x: p.x,
        y: p.y,
      }));
      const kinds = playZoneKindsForRuntime(zone, playAreaChallengeGoals, zoneCount);
      if (kinds.length === 0) return '';
      return `  {
    kinds: ${JSON.stringify(kinds)},
    events: {
${kinds
    .map(
      kind =>
        `      ${JSON.stringify(kind)}: '${escapeJsString_(playAreaSuccessEventId(zone.id, kind))}'`
    )
    .join(',\n')}
    },
    points: ${JSON.stringify(points)},
  }`;
    })
    .filter(Boolean)
    .join(',\n');

  if (!zoneLiterals) return '';

  return `
const MAT_ITEM_NODE_IDS = ${JSON.stringify(itemNodeIds)};
const ROBOT_MAT_SAMPLE_IDS = ['left_wheel_link', 'right_wheel_link', 'chassis', 'robot'];

function nodeMatLocal_(nodeId) {
  return scene.getNodeMatLocal(nodeId);
}

function robotSampleInZone_(zone, nodeId) {
  const p = nodeMatLocal_(nodeId);
  return !!(p && pointInPolygon_(p.x, p.y, zone.points));
}

/** Robot in zone when link mesh bounds overlap the play-area column on the mat. */
function robotIntersectsZone_(zone) {
  if (typeof scene.robotIntersectsPlayZone === 'function') {
    return scene.robotIntersectsPlayZone(zone.points);
  }
  for (const nodeId of ROBOT_MAT_SAMPLE_IDS) {
    if (robotSampleInZone_(zone, nodeId)) {
      return true;
    }
  }
  return false;
}

function pointInPolygon_(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    if (((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

const PLAY_ZONE_RUNTIME = [
${zoneLiterals}
];

const zoneRobotWasIn_ = PLAY_ZONE_RUNTIME.map(() => false);
const zoneRobotLeaveFrames_ = PLAY_ZONE_RUNTIME.map(() => 0);
const ROBOT_ZONE_LEAVE_DEBOUNCE_FRAMES = 4;

scene.addOnRenderListener(() => {
  if (scene.programStatus !== 'running') return;
  for (let zi = 0; zi < PLAY_ZONE_RUNTIME.length; zi++) {
    const zone = PLAY_ZONE_RUNTIME[zi];
    const robotInRaw = robotIntersectsZone_(zone);
    if (robotInRaw) {
      zoneRobotLeaveFrames_[zi] = 0;
    } else if (zoneRobotWasIn_[zi]) {
      zoneRobotLeaveFrames_[zi]++;
    } else {
      zoneRobotLeaveFrames_[zi] = 0;
    }
    const robotInStable =
      robotInRaw ||
      (zoneRobotWasIn_[zi] &&
        zoneRobotLeaveFrames_[zi] < ROBOT_ZONE_LEAVE_DEBOUNCE_FRAMES);
    const wasIn = zoneRobotWasIn_[zi];
    zoneRobotWasIn_[zi] = robotInStable;
    let anyItemIn = false;
    for (const nodeId of MAT_ITEM_NODE_IDS) {
      const local = nodeMatLocal_(nodeId);
      if (local && pointInPolygon_(local.x, local.y, zone.points)) {
        anyItemIn = true;
        break;
      }
    }
    for (const kind of zone.kinds) {
      const eventId = zone.events[kind];
      let value = false;
      switch (kind) {
        case 'robotIntersecting':
          // Stay true while the robot remains in the zone (Once latch keeps success).
          value = robotInStable;
          break;
        case 'robotNotIntersecting': {
          value = !robotInStable && wasIn;
          const leaveKey = '__jbcPzLeave_' + zi;
          if (value && !globalThis[leaveKey]) {
            globalThis[leaveKey] = true;
            console.log('[custom-jbc play-area] robot left zone', eventId, {
              zoneIndex: zi,
              robotInRaw,
              robotInStable,
              wasIn,
              leaveFrames: zoneRobotLeaveFrames_[zi],
            });
          }
          if (robotInStable) globalThis[leaveKey] = false;
          break;
        }
        case 'anyItemIntersecting':
          value = anyItemIn;
          break;
        case 'anyItemNotIntersecting':
          value = !anyItemIn;
          break;
      }
      scene.setChallengeEventValue(eventId, value);
    }
  }
});
`;
}

function mergedItemConditionGoals_(
  placement: MatPlacementSelection,
  choices: Record<string, ItemSuccessOutcomeId>,
  worldItems: WorldSceneItem[],
  challengeGoals: ConditionGoalInput[] = []
): ConditionGoalInput[] {
  return mergeConditionGoals([
    ...conditionGoalsFromItemWizardChoices(
      placement.worldItemKeys,
      placement.geometryKeys,
      worldItems,
      choices
    ),
    ...challengeGoals,
  ]);
}

/** How a can pose goal maps to setChallengeEventValue in the render loop. */
type CanPoseEmitMode = 'trueWhenKnocked' | 'trueWhenUpright';

function parseCanPoseGoal_(
  goal: ConditionGoalInput
): { nodeId: string; mode: CanPoseEmitMode } | null {
  const id = goal.eventId;

  const notKnocked = /^(can[a-z0-9]+)NotKnockedOver$/i.exec(id);
  if (notKnocked) {
    return { nodeId: notKnocked[1], mode: 'trueWhenUpright' };
  }

  const knock = /^(can[a-z0-9]+)(?:KnockedOver|NotUpright|Notupright)$/i.exec(id);
  if (knock) {
    return { nodeId: knock[1], mode: 'trueWhenKnocked' };
  }

  const upright = /^(can[a-z0-9]+)Upright$/i.exec(id);
  if (upright && !/not/i.test(id)) {
    return { nodeId: upright[1], mode: 'trueWhenUpright' };
  }

  return null;
}

function isCanPoseChallengeGoal_(goal: ConditionGoalInput): boolean {
  return (
    CAN_CUSTOM_EVENT.test(goal.eventId) ||
    CAN_CATALOG_POSE_EVENT.test(goal.eventId)
  );
}

function isCustomItemRuntimeGoal_(goal: ConditionGoalInput): boolean {
  return (
    isCanPoseChallengeGoal_(goal) || isReamStopNearSuccessEventId(goal.eventId)
  );
}

function scriptCoversCanPoseGoals_(code: string, goals: ConditionGoalInput[]): boolean {
  for (const goal of goals) {
    if (!parseCanPoseGoal_(goal)) continue;
    if (!code.includes(`setChallengeEventValue('${escapeJsString_(goal.eventId)}'`)) {
      return false;
    }
  }
  return true;
}

function buildItemTouchListeners_(
  placement: MatPlacementSelection,
  choices: Record<string, ItemSuccessOutcomeId>,
  worldItems: WorldSceneItem[],
  challengeGoals: ConditionGoalInput[] = []
): string {
  const goals = mergedItemConditionGoals_(
    placement,
    choices,
    worldItems,
    challengeGoals
  );
  const lines: string[] = [];

  for (const goal of goals) {
    if (/NeverTouched$/i.test(goal.eventId)) continue;

    const touchMatch = /^(can[a-z0-9]+)Touched$/i.exec(goal.eventId);
    if (touchMatch) {
      const canId = touchMatch[1];
      const eventId = escapeJsString_(goal.eventId);
      // Preset JBC (e.g. Tag You're It) uses physics collision on the can, not
      // robot intersection — intersection only tests the robot's first link mesh.
      lines.push(`
// TOUCH_COLLISION_ON_CAN
// TOUCH_SKIP_NEVER_TOUCHED
scene.addOnCollisionListener('${escapeJsString_(canId)}', (otherNodeId) => {
  if (scene.programStatus === 'running') {
    scene.setChallengeEventValue('${eventId}', true);
  }
}, 'robot');`);
      continue;
    }

    const reamTouchMatch = /^(ream[a-z0-9]+)Touched$/i.exec(goal.eventId);
    if (reamTouchMatch) {
      const reamId = reamTouchMatch[1];
      const eventId = escapeJsString_(goal.eventId);
      lines.push(`
// REAM_TOUCH_COLLISION
scene.addOnCollisionListener('${escapeJsString_(reamId)}', (otherNodeId) => {
  if (scene.programStatus === 'running') {
    scene.setChallengeEventValue('${eventId}', true);
  }
}, 'robot');`);
      continue;
    }

    const reachMatch = /^(can[a-z0-9]+)Reached$/i.exec(goal.eventId);
    if (reachMatch) {
      const nodeId = reachMatch[1];
      const eventId = escapeJsString_(goal.eventId);
      lines.push(`
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  if (
    scene.programStatus === 'running' &&
    type === 'start' &&
    otherNodeId === '${escapeJsString_(nodeId)}'
  ) {
    scene.setChallengeEventValue('${eventId}', true);
  }
}, '${escapeJsString_(nodeId)}');`);
      continue;
    }

    const markerReachedMatch = /^(.+)(Reached|Inside|Touched)$/i.exec(goal.eventId);
    if (markerReachedMatch) {
      const nodeId = markerReachedMatch[1];
      const eventId = escapeJsString_(goal.eventId);
      lines.push(`
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  if (
    scene.programStatus === 'running' &&
    type === 'start' &&
    otherNodeId === '${escapeJsString_(nodeId)}'
  ) {
    setCustomChallengeMarkerVisibleForEvent_('${eventId}', true);
    scene.setChallengeEventValue('${eventId}', true);
  }
}, '${escapeJsString_(nodeId)}');`);
      continue;
    }

    const startBoxEventMatch = /^(notInStartBox|inStartBox)$/i.exec(goal.eventId);
    if (startBoxEventMatch) {
      const isNot = /^not/i.test(goal.eventId);
      const targetNodeId = isNot ? 'notStartBox' : 'startBox';
      const eventId = escapeJsString_(goal.eventId);
      const targetNodeIdEscaped = escapeJsString_(targetNodeId);
      // Match preset JBC (e.g. jbc0): collision volumes stay invisible; do not toggle marker visibility.
      if (isNot) {
        lines.push(`
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  if (scene.programStatus === 'running' && otherNodeId === '${targetNodeIdEscaped}') {
    scene.setChallengeEventValue('${eventId}', type === 'start');
  }
}, '${targetNodeIdEscaped}');`);
      } else {
        lines.push(`
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  if (scene.programStatus === 'running' && otherNodeId === '${targetNodeIdEscaped}') {
    if (type === 'start') {
      console.log('[custom-jbc start-box] robot intersection', {
        type,
        otherNodeId,
        eventId: '${eventId}',
        programStatus: scene.programStatus,
      });
      scene.setChallengeEventValue('${eventId}', true);
    }
  }
}, '${targetNodeIdEscaped}');`);
      }
      continue;
    }

    const insideEventMatch = /^in(.+)$/i.exec(goal.eventId);
    if (insideEventMatch) {
      const rawNodeId = insideEventMatch[1];
      const nodeId = rawNodeId.charAt(0).toLowerCase() + rawNodeId.slice(1);
      const eventId = escapeJsString_(goal.eventId);
      lines.push(`
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  if (scene.programStatus === 'running' && otherNodeId === '${escapeJsString_(nodeId)}') {
    setCustomChallengeMarkerVisibleForEvent_('${eventId}', type === 'start');
    scene.setChallengeEventValue('${eventId}', type === 'start');
  }
}, '${escapeJsString_(nodeId)}');`);
      continue;
    }

    const coveredMatch = /^(.+)Covered$/i.exec(goal.eventId);
    if (!coveredMatch) continue;
    const coveredNodeId = coveredMatch[1];
    const eventId = escapeJsString_(goal.eventId);
    const covererNodeIds = [
      'robot',
      ...placement.worldItemKeys.map(nodeIdForPlacementKey_),
    ].filter(id => id !== coveredNodeId);
    for (const covererNodeId of covererNodeIds) {
      lines.push(`
scene.addOnIntersectionListener('${escapeJsString_(covererNodeId)}', (type, otherNodeId) => {
  if (
    scene.programStatus === 'running' &&
    type === 'start' &&
    otherNodeId === '${escapeJsString_(coveredNodeId)}'
  ) {
    setCustomChallengeMarkerVisibleForEvent_('${eventId}', true);
    scene.setChallengeEventValue('${eventId}', true);
  }
}, '${escapeJsString_(coveredNodeId)}');`);
    }
  }

  return lines.join('\n');
}

function eventIdForItemOutcome_(
  itemKey: string,
  outcomeId: ItemSuccessOutcomeId,
  placement: MatPlacementSelection,
  worldItems: WorldSceneItem[]
): string | null {
  const steps = buildItemSuccessWizardSteps(
    placement.worldItemKeys,
    placement.geometryKeys,
    worldItems
  );
  const step = steps.find(s => s.itemKey === itemKey || s.id === itemKey);
  if (!step) return null;
  const goals = conditionGoalsForItemOutcome(step, outcomeId);
  return goals[0]?.eventId ?? null;
}

export interface MatItemPoseChallengeWatch {
  eventId: string;
  nodeId: string;
  trueWhenKnocked: boolean;
}

/** Mat-item pose rules to drive (wizard choices + challenge goals on the scene). */
export function collectMatItemPoseChallengeWatches(
  placement: MatPlacementSelection,
  choices: Record<string, ItemSuccessOutcomeId>,
  worldItems: WorldSceneItem[],
  challengeGoals: ConditionGoalInput[] = []
): MatItemPoseChallengeWatch[] {
  const watches: MatItemPoseChallengeWatch[] = [];
  const seen = new Set<string>();

  const push_ = (eventId: string, nodeId: string, trueWhenKnocked: boolean) => {
    const key = `${eventId}\0${String(trueWhenKnocked)}`;
    if (seen.has(key)) return;
    seen.add(key);
    watches.push({ eventId, nodeId, trueWhenKnocked });
  };

  for (const [itemKey, outcomeId] of Object.entries(choices)) {
    if (outcomeId !== 'knock_over' && outcomeId !== 'stay_upright') continue;
    const nodeId = nodeIdForPlacementKey_(itemKey);
    if (!/^can[a-z0-9]+$/i.test(nodeId)) continue;

    const eventId =
      eventIdForItemOutcome_(itemKey, outcomeId, placement, worldItems) ??
      (outcomeId === 'knock_over'
        ? sanitizeChallengeEventId(`${nodeId}KnockedOver`)
        : sanitizeChallengeEventId(`${nodeId}Upright`));

    push_(eventId, nodeId, outcomeId === 'knock_over');
    if (outcomeId === 'knock_over') {
      push_(
        sanitizeChallengeEventId(`${nodeId}NotKnockedOver`),
        nodeId,
        false
      );
    }
  }

  const knockedNodeIds = new Set<string>();
  for (const goal of mergedItemConditionGoals_(
    placement,
    choices,
    worldItems,
    challengeGoals
  )) {
    const pose = parseCanPoseGoal_(goal);
    if (!pose) continue;
    push_(goal.eventId, pose.nodeId, pose.mode === 'trueWhenKnocked');
    if (pose.mode === 'trueWhenKnocked') {
      knockedNodeIds.add(pose.nodeId);
    }
  }

  for (const nodeId of knockedNodeIds) {
    push_(
      sanitizeChallengeEventId(`${nodeId}KnockedOver`),
      nodeId,
      true
    );
    push_(
      sanitizeChallengeEventId(`${nodeId}NotKnockedOver`),
      nodeId,
      false
    );
  }

  return watches;
}

function buildItemUpdateListeners_(
  placement: MatPlacementSelection,
  choices: Record<string, ItemSuccessOutcomeId>,
  worldItems: WorldSceneItem[],
  challengeGoals: ConditionGoalInput[] = []
): string {
  const watches = collectMatItemPoseChallengeWatches(
    placement,
    choices,
    worldItems,
    challengeGoals
  );
  if (watches.length === 0) return '';

  // Knock-over before still-standing so paired failure clears when tip is detected.
  const ordered = [...watches].sort(
    (a, b) => Number(b.trueWhenKnocked) - Number(a.trueWhenKnocked)
  );
  const lines = ordered.map(({ eventId, nodeId, trueWhenKnocked }) => {
    const eid = escapeJsString_(eventId);
    const nid = escapeJsString_(nodeId);
    if (trueWhenKnocked) {
      return `  (function() {
    const knocked = !nodeUprightForChallenge_('${nid}');
    const prevKey = '__jbcKoPrev_${nid}';
    if (knocked !== globalThis[prevKey]) {
      globalThis[prevKey] = knocked;
      scene.setChallengeEventValue('${eid}', knocked);
    }
  })();`;
    }
    return `  (function() {
    const upright = nodeUprightForChallenge_('${nid}');
    const prevKey = '__jbcKoUp_${nid}_${eid}';
    if (upright !== globalThis[prevKey]) {
      globalThis[prevKey] = upright;
      scene.setChallengeEventValue('${eid}', upright);
    }
  })();`;
  });

  // Preset JBC uprightCans: no programStatus guard on the render loop (emit still guarded in ScriptManager).
  return `
// KNOCK_OVER_LIVE_POSE
function nodeUprightForChallenge_(nodeId) {
  if (typeof scene.getNodeUpright === 'function') {
    return scene.getNodeUpright(nodeId);
  }
  return nodeUpright(nodeId);
}

scene.addOnRenderListener(() => {
${lines.join('\n')}
});
`;
}

export function buildCustomChallengeRuntimeScript(
  input: CustomChallengeRuntimeScriptInput
): string {
  const challengeItemGoals = mergeConditionGoals([
    ...(input.challengeSuccessGoals ?? []),
    ...(input.challengeFailureGoals ?? []),
    ...(input.itemChallengeGoals ?? []),
  ]);
  const playZoneBlock = buildPlayZoneRuntime_(input);
  const touchBlock = buildItemTouchListeners_(
    input.placement,
    input.itemSuccessChoices,
    input.worldItems,
    challengeItemGoals
  );
  const updateBlock = buildItemUpdateListeners_(
    input.placement,
    input.itemSuccessChoices,
    input.worldItems,
    challengeItemGoals
  );
  const stopNearBlock = buildReamStopNearRuntime_(
    input.placement,
    input.itemSuccessChoices,
    input.worldItems,
    challengeItemGoals
  );
  const markerBlock = buildChallengeMarkerRuntime_(input);

  return `// Auto-generated — updates challenge events for play areas and mat items.
// PLAY_AREA_LEAVE_DEBUG
// PLAY_AREA_ROBOT_BODY_BOUNDS
// PLAY_AREA_OPPOSITE_EVENTS
// ITEM_RULES_FROM_PREDICATE
// START_BOX_RUNTIME_HIGHLIGHT
// CUSTOM_MARKER_RUNTIME_VISIBILITY
// JBC_NODE_UPRIGHT
${nodeUpright}
${markerBlock}
${playZoneBlock}
${touchBlock}
// REAM_STOP_NEAR_RUNTIME
${stopNearBlock}
${updateBlock}
`;
}

export function applyCustomChallengeRuntimeScriptToScene(
  scene: Scene,
  input: CustomChallengeRuntimeScriptInput
): Scene {
  const challengeItemGoals = mergeConditionGoals([
    ...(input.challengeSuccessGoals ?? []),
    ...(input.challengeFailureGoals ?? []),
    ...(input.itemChallengeGoals ?? []),
  ]);
  const stopNearReamIds = collectReamStopNearWatches(
    input.placement,
    input.itemSuccessChoices,
    input.worldItems,
    challengeItemGoals
  ).map(w => w.reamNodeId);
  let next =
    input.authoringPreview === true
      ? scene
      : setCustomChallengeMarkerNodesVisible_(scene, false);
  next = syncReamFrontBoundariesOnScene(next, stopNearReamIds);

  const body = buildCustomChallengeRuntimeScript(input);
  const script = Script.ecmaScript('Custom challenge rules (auto)', body);
  next = {
    ...next,
    scripts: {
      ...(next.scripts ?? {}),
      [RUNTIME_SCRIPT_ID]: script,
    },
  };
  return bindRuntimeScriptToRobotNode_(next);
}

/** Load or reload the auto runtime so play-area listeners match the current scene script body. */
export function reinstantiateCustomChallengeRuntimeScript(
  scriptManager: { set: (id: string, script: Script) => void; bind: (scriptId: string, nodeId: string) => void },
  scene: Scene
): void {
  const script = scene.scripts?.[RUNTIME_SCRIPT_ID];
  if (!script) return;
  scriptManager.set(RUNTIME_SCRIPT_ID, script);
  const withRobotBinding = bindRuntimeScriptToRobotNode_(scene);
  if (withRobotBinding.nodes?.robot?.scriptIds?.includes(RUNTIME_SCRIPT_ID)) {
    scriptManager.bind(RUNTIME_SCRIPT_ID, 'robot');
  }
}

const STALE_PLAY_AREA_RUNTIME_MARKERS = [
  'matOriginCm_',
  'nodeMatLocal_(nodeId) {\n  const n = scene.nodes',
  'const robot = nodeMatLocal_(\'robot\')',
  'itemUprightState_',
  'TransformCoordinates',
  'applyRotationQuaternionInPlace',
];

function customChallengeRuntimeScriptIsStale_(code: string): boolean {
  if (!code.includes('PLAY_AREA_OPPOSITE_EVENTS')) return true;
  if (!code.includes('robotIntersectsZone_')) return true;
  // Robot must be the intersection primary node, not listed in the filter.
  if (
    /addOnIntersectionListener\(\s*'can[a-z0-9]+'[\s\S]*?},\s*'robot'\s*\)/i.test(
      code
    )
  ) {
    return true;
  }
  if (code.includes('challengeNodeUpright(')) return true;
  if (code.includes('challengeNodeKnocked(')) return true;
  if (code.includes('matItemNodeUpright(')) return true;
  if (code.includes('LIVE_NODE_UPRIGHT')) return true;
  if (!code.includes('yAngle(nodeId)')) return true;
  if (code.includes('customChallengeLogKnockOver_')) return true;
  if (code.includes('KNOCK_DEBUG_LOG')) return true;
  if (code.includes('KNOCK_OVER_HYSTERESIS')) return true;
  if (code.includes('knockedStable_')) return true;
  if (code.includes('KNOCK_OVER_CONSOLE_DEBUG')) return true;
  if (code.includes('[custom-jbc knock-over] detected')) return true;
  if (code.includes('[custom-jbc knock-over] runtime loaded')) return true;
  if (!code.includes('__jbcKoUp_')) return true;
  if (!code.includes('TOUCH_COLLISION_ON_CAN')) return true;
  if (!code.includes('TOUCH_SKIP_NEVER_TOUCHED')) return true;
  if (!code.includes('REAM_STOP_NEAR_RUNTIME')) return true;
  if (!code.includes('REAM_STOP_NEAR_WORLD_HORIZ')) return true;
  if (!code.includes('REAM_STOP_NEAR_BABYLON_CM')) return true;
  if (code.includes('REAM_STOP_NEAR_CLAW_MAT_LOCAL')) return true;
  if (code.includes('getNodeMatLocal(reamNodeId)')) return true;
  if (!code.includes('REAM_FRONT_BOUNDARY_TIGHT')) return true;
  if (!code.includes('REAM_STOP_NEAR_PROXIMITY_ON_STOP_ONLY')) return true;
  if (!code.includes('REAM_ROBOT_SAMPLE_IDS')) return true;
  if (code.includes('__REAM_BLACK_LINE_THRESHOLD')) return true;
  if (code.includes('[custom-jbc ream-stop-near]')) return true;
  if (code.includes('REAM_STOP_NEAR_DEBUG')) return true;
  if (code.includes('__reamStopNearFrame')) return true;
  if (code.includes('__reamMinDistCm_')) return true;
  if (!code.includes('KNOCK_OVER_LIVE_POSE')) return true;
  if (!code.includes('scene.getNodeUpright')) return true;
  if (!code.includes('ROBOT_ZONE_LEAVE_DEBOUNCE_FRAMES')) return true;
  if (!code.includes('PLAY_AREA_LEAVE_DEBUG')) return true;
  if (!code.includes('PLAY_AREA_ROBOT_BODY_BOUNDS')) return true;
  if (!code.includes('robotIntersectsPlayZone')) return true;
  if (code.includes('PLAY_AREA_ROBOT_OR_SAMPLES')) return true;
  if (code.includes('PLAY_AREA_ROBOT_FOOTPRINT')) return true;
  if (!code.includes('ITEM_RULES_FROM_PREDICATE')) return true;
  if (!code.includes('START_BOX_RUNTIME_HIGHLIGHT')) return true;
  if (
    code.includes("otherNodeId === 'startBox'") &&
    !code.includes('[custom-jbc start-box] robot intersection')
  ) {
    return true;
  }
  if (
    code.includes('[custom-jbc start-box] robot intersection') &&
    !code.includes("if (type === 'start')")
  ) {
    return true;
  }
  if (!code.includes('CUSTOM_MARKER_RUNTIME_VISIBILITY')) return true;
  return STALE_PLAY_AREA_RUNTIME_MARKERS.some(m => code.includes(m));
}

export interface CustomChallengeRuntimeRefreshOptions {
  playAreaChallengeGoals?: ConditionGoalInput[];
  challengeSuccessGoals?: ConditionGoalInput[];
  challengeFailureGoals?: ConditionGoalInput[];
  successPredicate?: Predicate;
  failurePredicate?: Predicate;
  authoringPreview?: boolean;
}

function itemSuccessChoicesFromScene_(
  scene: Scene
): Record<string, ItemSuccessOutcomeId> {
  return (scene.customChallengeItemSuccessChoices ??
    {}) as Record<string, ItemSuccessOutcomeId>;
}

function hasItemSuccessRuntimeListeners_(
  scene: Scene,
  worldItems: WorldSceneItem[],
  choices: Record<string, ItemSuccessOutcomeId>,
  challengeGoals: ConditionGoalInput[] = []
): boolean {
  const placement = matPlacementFromScene(scene);
  return (
    buildItemUpdateListeners_(placement, choices, worldItems, challengeGoals) !== '' ||
    buildItemTouchListeners_(placement, choices, worldItems, challengeGoals) !== '' ||
    buildReamStopNearRuntime_(placement, choices, worldItems, challengeGoals) !== ''
  );
}

function hasPlayAreaRuntimeListeners_(
  scene: Scene,
  goalsForRuntime: ConditionGoalInput[]
): boolean {
  if (!scene.matPlayZones?.length) return false;
  if (!sceneHasPlayAreaChallengeRules(scene, goalsForRuntime)) return false;
  const playZones = playZonesForRuntimeScript(
    matPlayZonesFromScene(scene),
    goalsForRuntime
  );
  return playZones.some(
    (zone, _i, arr) => playZoneKindsForRuntime(zone, goalsForRuntime, arr.length).length > 0
  );
}

function itemChallengeGoalsFromOptions_(
  options: CustomChallengeRuntimeRefreshOptions
): ConditionGoalInput[] {
  return mergeConditionGoals([
    ...(options.challengeSuccessGoals ?? []),
    ...(options.challengeFailureGoals ?? []),
  ]);
}

/** Goals from lists plus every Event expr on success/failure predicates (source of truth). */
function resolveItemChallengeGoals_(
  options: CustomChallengeRuntimeRefreshOptions
): ConditionGoalInput[] {
  const merged = itemChallengeGoalsFromOptions_(options);
  const fromPredicates: ConditionGoalInput[] = [];
  for (const predicate of [options.successPredicate, options.failurePredicate]) {
    if (!predicate) continue;
    for (const expr of Object.values(predicate.exprs)) {
      if (expr.type !== Expr.Type.Event) continue;
      if (!isCustomItemRuntimeGoal_({ eventId: expr.eventId, label: '' })) continue;
      fromPredicates.push({
        eventId: expr.eventId,
        label: expr.eventId,
        latchOnce: true,
      });
    }
  }
  return mergeConditionGoals([...merged, ...fromPredicates]);
}

function hasKnockOverSuccessGoals_(
  options: CustomChallengeRuntimeRefreshOptions
): boolean {
  return resolveItemChallengeGoals_(options).some(
    g => parseCanPoseGoal_(g)?.mode === 'trueWhenKnocked'
  );
}

function applyCustomChallengeRuntimeIfNeeded_(
  scene: Scene,
  worldItems: WorldSceneItem[],
  goalsForRuntime: ConditionGoalInput[],
  itemSuccessChoices: Record<string, ItemSuccessOutcomeId>,
  refreshOptions: CustomChallengeRuntimeRefreshOptions = {}
): Scene {
  const runtimeScene =
    refreshOptions.authoringPreview === true
      ? scene
      : setCustomChallengeMarkerNodesVisible_(scene, false);
  const itemChallengeGoals = resolveItemChallengeGoals_(refreshOptions);
  const needsItems = hasItemSuccessRuntimeListeners_(
    runtimeScene,
    worldItems,
    itemSuccessChoices,
    itemChallengeGoals
  );
  const needsPlayArea = hasPlayAreaRuntimeListeners_(runtimeScene, goalsForRuntime);
  if (!needsItems && !needsPlayArea) {
    return bindRuntimeScriptToRobotNode_(runtimeScene);
  }

  const placement = matPlacementFromScene(runtimeScene);
  const playZones = needsPlayArea
    ? playZonesForRuntimeScript(matPlayZonesFromScene(runtimeScene), goalsForRuntime)
    : [];

  return applyCustomChallengeRuntimeScriptToScene(runtimeScene, {
    playZones,
    placement,
    itemSuccessChoices,
    worldItems,
    playAreaChallengeGoals: goalsForRuntime,
    itemChallengeGoals,
    challengeSuccessGoals: refreshOptions.challengeSuccessGoals,
    challengeFailureGoals: refreshOptions.challengeFailureGoals,
    authoringPreview: refreshOptions.authoringPreview,
  });
}

function resolvePlayAreaGoalsForRuntime_(
  scene: Scene,
  options: CustomChallengeRuntimeRefreshOptions = {}
): ConditionGoalInput[] {
  if (options.playAreaChallengeGoals?.length) {
    return mergeConditionGoals([
      ...mergePlayAreaGoalsForRuntime(scene, {
        challengeSuccessGoals: options.challengeSuccessGoals,
        challengeFailureGoals: options.challengeFailureGoals,
        successPredicate: options.successPredicate,
        failurePredicate: options.failurePredicate,
      }),
      ...options.playAreaChallengeGoals,
    ]);
  }
  return mergePlayAreaGoalsForRuntime(scene, {
    challengeSuccessGoals: options.challengeSuccessGoals,
    challengeFailureGoals: options.challengeFailureGoals,
    successPredicate: options.successPredicate,
    failurePredicate: options.failurePredicate,
  });
}

/** Rebuild auto runtime when play-area detection used stale Redux poses. */
export function refreshCustomChallengeRuntimeScriptOnScene(
  scene: Scene,
  worldItems: WorldSceneItem[],
  options: CustomChallengeRuntimeRefreshOptions | ConditionGoalInput[] = {}
): Scene {
  const refreshOptions: CustomChallengeRuntimeRefreshOptions = Array.isArray(options)
    ? { playAreaChallengeGoals: options }
    : options;
  const runtimeScene =
    refreshOptions.authoringPreview === true
      ? scene
      : setCustomChallengeMarkerNodesVisible_(scene, false);
  const existing = runtimeScene.scripts?.[RUNTIME_SCRIPT_ID]?.code ?? '';
  const goalsForRuntime = resolvePlayAreaGoalsForRuntime_(runtimeScene, refreshOptions);
  const itemSuccessChoices = itemSuccessChoicesFromScene_(runtimeScene);
  const itemChallengeGoals = resolveItemChallengeGoals_(refreshOptions);
  const needsItems = hasItemSuccessRuntimeListeners_(
    runtimeScene,
    worldItems,
    itemSuccessChoices,
    itemChallengeGoals
  );
  const needsPlayArea = hasPlayAreaRuntimeListeners_(runtimeScene, goalsForRuntime);

  if (!needsItems && !needsPlayArea) {
    return bindRuntimeScriptToRobotNode_(runtimeScene);
  }

  const canPoseGoals = itemChallengeGoals.filter(isCanPoseChallengeGoal_);
  const needsRefresh =
    customChallengeRuntimeScriptIsStale_(existing) ||
    sceneNeedsPlayAreaRuntimeRefresh_(runtimeScene, existing) ||
    (canPoseGoals.length > 0 && !scriptCoversCanPoseGoals_(existing, canPoseGoals));

  if (!needsRefresh) {
    return bindRuntimeScriptToRobotNode_(runtimeScene);
  }

  return applyCustomChallengeRuntimeIfNeeded_(
    runtimeScene,
    worldItems,
    goalsForRuntime,
    itemSuccessChoices,
    refreshOptions
  );
}

/** Always rebuild play-area runtime (used when entering the challenge route). */
export function forceCustomChallengeRuntimeScriptOnScene(
  scene: Scene,
  worldItems: WorldSceneItem[],
  options: CustomChallengeRuntimeRefreshOptions | ConditionGoalInput[] = {}
): Scene {
  const refreshOptions: CustomChallengeRuntimeRefreshOptions = Array.isArray(options)
    ? { playAreaChallengeGoals: options }
    : options;
  const goalsForRuntime = resolvePlayAreaGoalsForRuntime_(scene, refreshOptions);
  const itemSuccessChoices = itemSuccessChoicesFromScene_(scene);
  return applyCustomChallengeRuntimeIfNeeded_(
    scene,
    worldItems,
    goalsForRuntime,
    itemSuccessChoices,
    refreshOptions
  );
}

/** Refresh runtime script and push scene into the simulator when play-area rules may be missing. */
export function prepareCustomChallengeSceneForSimulator(
  scene: Scene,
  worldItems: WorldSceneItem[],
  options: (CustomChallengeRuntimeRefreshOptions & { forceRebuild?: boolean }) | ConditionGoalInput[] = {}
): Scene {
  const refreshOptions: CustomChallengeRuntimeRefreshOptions & { forceRebuild?: boolean } =
    Array.isArray(options) ? { playAreaChallengeGoals: options } : options;
  const { forceRebuild, ...runtimeOptions } = refreshOptions;
  if (forceRebuild || hasKnockOverSuccessGoals_(runtimeOptions)) {
    return forceCustomChallengeRuntimeScriptOnScene(scene, worldItems, runtimeOptions);
  }
  return refreshCustomChallengeRuntimeScriptOnScene(scene, worldItems, runtimeOptions);
}
