import Scene from '../state/State/Scene';
import Node from '../state/State/Scene/Node';
import Geometry from '../state/State/Scene/Geometry';
import { Color } from '../state/State/Scene/Color';
import { Distance } from './math/Value';
import { RotationwUnits } from './math/unitMath';
import LocalizedString from './LocalizedString';
import {
  ConditionGoalInput,
  mergeConditionGoals,
} from './customChallengePredicates';
import {
  buildItemSuccessWizardSteps,
  conditionGoalsFromItemWizardChoices,
  ItemSuccessOutcomeId,
} from './jbcChallengeSuggestions';
import { MatPlacementSelection, horizontalWorldDistCm } from './jbcMatPlayArea';
import { WorldSceneItem } from './jbcChallengeCatalog';

/** Max mat-local distance (cm) from robot front to ream center = "near". */
export const REAM_STOP_NEAR_DISTANCE_CM = 22;

/** Robot parts checked for stop-near proximity (claw first, chassis fallback). */
export const REAM_STOP_NEAR_SAMPLE_NODE_IDS = ['claw_link', 'chassis'] as const;

export const REAM_ROBOT_SAMPLE_NODE_IDS = [
  'robot',
  'left_wheel_link',
  'right_wheel_link',
  'chassis',
  'claw_link',
] as const;

/** Matches `geometryId: 'ream'` box depth (short axis when the ream lies on the mat). */
const REAM_TEMPLATE_DEPTH_CM = 21.59;

/** Gap from ream front face to the center of the scoring slab (cm). */
const REAM_BOUNDARY_FACE_GAP_CM = 1.5;

/** Invisible scoring slab hugging the ream front face (not the full JBC 21 8.5" zone). */
const REAM_FRONT_BOUNDARY_GEOM: Geometry = {
  type: 'box',
  size: {
    x: Distance.centimeters(28),
    y: Distance.centimeters(4),
    z: Distance.centimeters(4),
  },
};

export interface ReamStopNearWatch {
  reamNodeId: string;
  eventId: string;
  boundaryNodeId: string;
}

export interface ReamStopNearProximity {
  near: boolean;
  minDistCm: number | null;
}

export function reamFrontBoundaryNodeId(reamNodeId: string): string {
  return `${reamNodeId}FrontBoundary`;
}

export function isReamStopNearSuccessEventId(eventId: string): boolean {
  return /^ream[a-z0-9]+StopNear$/i.test(eventId);
}

export function reamTouchedFailureEventId(reamNodeId: string): string {
  return `${reamNodeId}Touched`;
}

/** Success rows for "robot stops near ream" (reamNStopNear). */
export function stayReamStopNearSuccessGoals(
  successGoals: ConditionGoalInput[]
): Array<{ eventId: string; nodeId: string }> {
  const out: Array<{ eventId: string; nodeId: string }> = [];
  for (const goal of successGoals) {
    const match = /^(ream[a-z0-9]+)StopNear$/i.exec(goal.eventId);
    if (!match) continue;
    out.push({ eventId: goal.eventId, nodeId: match[1] });
  }
  return out;
}

type ReamStopNearDistResolver = (reamNodeId: string) => number | null;

/** Horizontal world distance (cm) from robot front to ream center (live meshes only). */
export function robotNearReamHorizWorld_(
  resolveDistCm: ReamStopNearDistResolver,
  reamNodeId: string,
  maxDistCm: number = REAM_STOP_NEAR_DISTANCE_CM
): ReamStopNearProximity {
  const minDistCm = resolveDistCm(reamNodeId);
  if (minDistCm === null) {
    return { near: false, minDistCm: null };
  }
  return { near: minDistCm <= maxDistCm, minDistCm };
}

/** Build horizontal world distance from explicit world-cm sample + ream positions. */
export function horizDistRobotToReamWorldCm_(
  robotWorldCm: { x: number; y: number; z: number } | null,
  reamWorldCm: { x: number; y: number; z: number } | null
): number | null {
  if (!robotWorldCm || !reamWorldCm) return null;
  return horizontalWorldDistCm(robotWorldCm, reamWorldCm);
}

function mergedItemGoals_(
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

/** Ream proximity success rows that need runtime listeners. */
export function collectReamStopNearWatches(
  placement: MatPlacementSelection,
  choices: Record<string, ItemSuccessOutcomeId>,
  worldItems: WorldSceneItem[],
  challengeGoals: ConditionGoalInput[] = []
): ReamStopNearWatch[] {
  const watches: ReamStopNearWatch[] = [];
  const seen = new Set<string>();

  for (const goal of mergedItemGoals_(placement, choices, worldItems, challengeGoals)) {
    const match = /^(ream[a-z0-9]+)StopNear$/i.exec(goal.eventId);
    if (!match) continue;
    const reamNodeId = match[1];
    if (seen.has(reamNodeId)) continue;
    seen.add(reamNodeId);
    watches.push({
      reamNodeId,
      eventId: goal.eventId,
      boundaryNodeId: reamFrontBoundaryNodeId(reamNodeId),
    });
  }

  return watches;
}

function boundaryOriginForReam_(ream: Node.Obj): Node.Obj['origin'] {
  const reamPos = ream.origin.position;
  const zType = reamPos.z.type;
  const yType = reamPos.y.type;
  const boundaryHalfDepthCm = REAM_FRONT_BOUNDARY_GEOM.type === 'box'
    ? Distance.toCentimetersValue(REAM_FRONT_BOUNDARY_GEOM.size.z) / 2
    : 0;
  const centerOffsetCm =
    REAM_TEMPLATE_DEPTH_CM / 2 +
    REAM_BOUNDARY_FACE_GAP_CM +
    boundaryHalfDepthCm;
  return {
    position: {
      x: reamPos.x,
      y: Distance.subtract(reamPos.y, Distance.centimeters(1.175), yType),
      z: Distance.subtract(reamPos.z, Distance.centimeters(centerOffsetCm), zType),
    },
    orientation: ream.origin.orientation ?? RotationwUnits.eulerDegrees(90, 0, 0),
  };
}

/** Ensure an invisible front boundary exists for each ream with stop-near scoring. */
export function syncReamFrontBoundariesOnScene(
  scene: Scene,
  reamNodeIds: ReadonlyArray<string>
): Scene {
  if (reamNodeIds.length === 0) return scene;

  const next = JSON.parse(JSON.stringify(scene)) as Scene;
  next.geometry = { ...(next.geometry ?? {}) };
  next.nodes = { ...(next.nodes ?? {}) };

  for (const reamId of reamNodeIds) {
    const ream = next.nodes[reamId];
    if (
      !ream ||
      (ream.type !== 'object' && ream.type !== 'from-jbc-template')
    ) {
      continue;
    }
    if (!('origin' in ream)) continue;

    const geomId = `${reamId}FrontBoundary_geom`;
    const boundaryId = reamFrontBoundaryNodeId(reamId);

    next.geometry[geomId] = JSON.parse(JSON.stringify(REAM_FRONT_BOUNDARY_GEOM)) as Geometry;
    next.nodes[boundaryId] = {
      type: 'object',
      geometryId: geomId,
      name: { [LocalizedString.EN_US]: `${reamId} front boundary` },
      visible: false,
      origin: boundaryOriginForReam_(ream as Node.Obj),
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 0, 0),
        },
      },
    };
  }

  return next;
}

function escapeJsString_(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** Runtime script: mat-local proximity + claw/boundary intersection → reamNStopNear. */
export function buildReamStopNearRuntime_(
  placement: MatPlacementSelection,
  choices: Record<string, ItemSuccessOutcomeId>,
  worldItems: WorldSceneItem[],
  challengeGoals: ConditionGoalInput[] = []
): string {
  const watches = collectReamStopNearWatches(
    placement,
    choices,
    worldItems,
    challengeGoals
  );
  if (watches.length === 0) return '';

  const lines: string[] = [
    '// REAM_STOP_NEAR_RUNTIME',
    '// REAM_FRONT_BOUNDARY_TIGHT',
    '// REAM_STOP_NEAR_PROXIMITY_ON_STOP_ONLY',
    '// REAM_STOP_NEAR_WORLD_HORIZ',
    '// REAM_STOP_NEAR_BABYLON_CM',
    '// REAM_ROBOT_SAMPLE_IDS',
  ];

  for (const watch of watches) {
    const eventId = escapeJsString_(watch.eventId);
    const boundaryId = escapeJsString_(watch.boundaryNodeId);
    lines.push(`
scene.addOnIntersectionListener('claw_link', (type, otherNodeId) => {
  if (scene.programStatus !== 'running') return;
  if (otherNodeId !== '${boundaryId}') return;
  if (type === 'start') {
    scene.setChallengeEventValue('${eventId}', true);
  }
}, '${boundaryId}');`);
  }

  return lines.join('\n');
}

/** Ream node ids on the mat that use stop-near (for boundary sync). */
export function reamNodeIdsForStopNearFromWizard(
  placement: MatPlacementSelection,
  choices: Record<string, ItemSuccessOutcomeId>,
  worldItems: WorldSceneItem[]
): string[] {
  const steps = buildItemSuccessWizardSteps(
    placement.worldItemKeys,
    placement.geometryKeys,
    worldItems
  );
  const ids: string[] = [];
  for (const step of steps) {
    if (step.itemKind !== 'ream') continue;
    if (choices[step.id] !== 'stop_near') continue;
    ids.push(step.nodeId);
  }
  return ids;
}
