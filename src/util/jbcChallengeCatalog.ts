import Challenge from '../state/State/Challenge';
import Event from '../state/State/Challenge/Event';
import Scene from '../state/State/Scene';
import Geometry from '../state/State/Scene/Geometry';
import Node from '../state/State/Scene/Node';
import { Color } from '../state/State/Scene/Color';
import LocalizedString from './LocalizedString';
import { CHALLENGE_LIST, ChallengeName } from '../simulator/definitions/challenges/challengeList';
import { JBC_0 } from '../simulator/definitions/scenes/jbc0-Drive-Straight';
import { JBC_1 } from '../simulator/definitions/scenes/jbc1-Tag-Youre-It';
import { JBC_2 } from '../simulator/definitions/scenes/jbc2-Ring-Around-the-Can';
import { JBC_3 } from '../simulator/definitions/scenes/jbc3-Precision-Parking';
import { JBC_4 } from '../simulator/definitions/scenes/jbc4-Serpentine';
import { JBC_5 } from '../simulator/definitions/scenes/jbc5-Odd-Numbers';
import { JBC_6 } from '../simulator/definitions/scenes/jbc6-Figure-Eight';
import { JBC_7 } from '../simulator/definitions/scenes/jbc7-Load-Em-Up';
import { JBC_8 } from '../simulator/definitions/scenes/jbc8-Bulldozer-Mania';
import { JBC_9 } from '../simulator/definitions/scenes/jbc9-Cover-Your-Bases';
import { JBC_10 } from '../simulator/definitions/scenes/jbc10-Chopped';
import { JBC_11 } from '../simulator/definitions/scenes/jbc11-Making-Waves';
import { JBC_12 } from '../simulator/definitions/scenes/jbc12-Add-It-Up';
import { JBC_14 } from '../simulator/definitions/scenes/jbc14-Dance-Party';
import { JBC_15 } from '../simulator/definitions/scenes/jbc15-Go-Fetch';
import { JBC_16 } from '../simulator/definitions/scenes/jbc16-Pick-Em-Up';
import { JBC_17 } from '../simulator/definitions/scenes/jbc17-Mountain-Rescue';
import { JBC_18 } from '../simulator/definitions/scenes/jbc18-Stackerz-New';
import { JBC_19 } from '../simulator/definitions/scenes/jbc19-Bump';
import { JBC_20 } from '../simulator/definitions/scenes/jbc20-Amazing';
import { JBC_21 } from '../simulator/definitions/scenes/jbc21-Proximity';
import { JBC_22 } from '../simulator/definitions/scenes/jbc22-Search-and-Rescue';
import { JBC_23 } from '../simulator/definitions/scenes/jbc23-Find-the-Black-Line';
import { JBC_24 } from '../simulator/definitions/scenes/jbc24-Walk-the-Line';
import { createCircleNode } from '../simulator/definitions/scenes/jbcBase';
import { preBuiltGeometries } from '../simulator/definitions/nodes';

import jbc0 from '../simulator/definitions/challenges/jbc0-Drive-Straight';
import jbc1 from '../simulator/definitions/challenges/jbc1-Tag-Youre-It';
import jbc2 from '../simulator/definitions/challenges/jbc2-Ring-Around-the-Can';
import jbc3 from '../simulator/definitions/challenges/jbc3-Precision-Parking';
import jbc4 from '../simulator/definitions/challenges/jbc4-Serpentine';
import jbc5 from '../simulator/definitions/challenges/jbc5-Odd-Numbers';
import jbc6 from '../simulator/definitions/challenges/jbc6-Figure-Eight';
import jbc7 from '../simulator/definitions/challenges/jbc7-Load-Em-Up';
import jbc8 from '../simulator/definitions/challenges/jbc8-Bulldozer-Mania';
import jbc9 from '../simulator/definitions/challenges/jbc9-Cover-Your-Bases';
import jbc10 from '../simulator/definitions/challenges/jbc10-Chopped';
import jbc11 from '../simulator/definitions/challenges/jbc11-Making-Waves';
import jbc12 from '../simulator/definitions/challenges/jbc12-Add-It-Up';
import jbc14 from '../simulator/definitions/challenges/jbc14-Dance-Party';
import jbc15 from '../simulator/definitions/challenges/jbc15-Go-Fetch';
import jbc16 from '../simulator/definitions/challenges/jbc16-Pick-Em-Up';
import jbc17 from '../simulator/definitions/challenges/jbc17-Mountain-Rescue';
import jbc18 from '../simulator/definitions/challenges/jbc18-Stackerz-New';
import jbc19 from '../simulator/definitions/challenges/jbc19-Bump';
import jbc20 from '../simulator/definitions/challenges/jbc20-Amazing';
import jbc21 from '../simulator/definitions/challenges/jbc21-Proximity';
import jbc22 from '../simulator/definitions/challenges/jbc22-Search-and-Rescue';
import jbc23 from '../simulator/definitions/challenges/jbc23-Find-the-Black-Line';
import jbc24 from '../simulator/definitions/challenges/jbc24-Walk-the-Line';

const JBC_CHALLENGE_SCENES: Record<ChallengeName, Scene> = {
  jbc0: JBC_0,
  jbc1: JBC_1,
  jbc2: JBC_2,
  jbc3: JBC_3,
  jbc4: JBC_4,
  jbc5: JBC_5,
  jbc6: JBC_6,
  jbc7: JBC_7,
  jbc8: JBC_8,
  jbc9: JBC_9,
  jbc10: JBC_10,
  jbc11: JBC_11,
  jbc12: JBC_12,
  jbc14: JBC_14,
  jbc15: JBC_15,
  jbc16: JBC_16,
  jbc17: JBC_17,
  jbc18: JBC_18,
  jbc19: JBC_19,
  jbc20: JBC_20,
  jbc21: JBC_21,
  jbc22: JBC_22,
  jbc23: JBC_23,
  jbc24: JBC_24,
};

const JBC_CHALLENGES: Record<ChallengeName, Challenge> = {
  jbc0,
  jbc1,
  jbc2,
  jbc3,
  jbc4,
  jbc5,
  jbc6,
  jbc7,
  jbc8,
  jbc9,
  jbc10,
  jbc11,
  jbc12,
  jbc14,
  jbc15,
  jbc16,
  jbc17,
  jbc18,
  jbc19,
  jbc20,
  jbc21,
  jbc22,
  jbc23,
  jbc24,
};

export type JbcChallengeRefId = ChallengeName | 'custom';

const START_BOX_NODE_ID = 'startBox';

interface CatalogGeometryVisibilityOptions {
  showStartBox?: boolean;
  showMarkers?: boolean;
}

export interface JbcChallengeRef {
  challengeId: JbcChallengeRefId;
  challengeName: string;
}

/** Event used across standard JBC challenges (deduped by event id). */
export interface JbcCatalogEvent {
  eventId: string;
  event: Event;
  displayName: string;
  usedIn: JbcChallengeRef[];
}

/** Scene object used in official JBC challenge scenes (deduped by node id). */
export interface JbcCatalogItem {
  key: string;
  nodeId: string;
  displayName: string;
  templateId?: string;
  usedIn: JbcChallengeRef[];
  /** Scene that holds geometry for this item when copied into a custom scene. */
  sourceSceneId: ChallengeName;
  sampleNode: Node;
}

/** Geometry used by nodes referenced in official JBC scene scripts (deduped by geometry id). */
export interface JbcCatalogGeometry {
  key: string;
  geometryId: string;
  displayName: string;
  geometryType: Geometry['type'];
  /** Scene node that uses this geometry in scripts (collision volume, marker, etc.). */
  nodeId: string;
  usedIn: JbcChallengeRef[];
  sourceSceneId: ChallengeName;
  sampleGeometry: Geometry;
  sampleNode: Node;
}

/** Success goal copied from a specific JBC challenge definition. */
export interface JbcCatalogSuccessGoal {
  key: string;
  eventId: string;
  label: string;
  latchOnce: boolean;
  source: JbcChallengeRef;
}

function challengeLabel(challengeId: ChallengeName, challenge: Challenge): string {
  const name = LocalizedString.lookup(challenge.name, LocalizedString.EN_US);
  return String(name || CHALLENGE_LIST[challengeId]);
}

function eventDisplayName(event: Event): string {
  return String(LocalizedString.lookup(event.name, LocalizedString.EN_US) || '');
}

const SCENE_ITEM_SKIP_IDS = new Set(['robot', 'ground', 'light0', 'matA', 'matB']);

export function isWorldSceneItemNode(nodeId: string, node: Node): boolean {
  if (SCENE_ITEM_SKIP_IDS.has(nodeId)) return false;
  if (nodeId.startsWith('light')) return false;
  if (/FrontBoundary$/i.test(nodeId)) return false;
  return node.type === 'object' || node.type === 'from-jbc-template';
}

/** Item entry for the World panel / sandbox scene (not the full JBC challenge catalog). */
export type WorldSceneItem = Pick<
JbcCatalogItem,
'key' | 'nodeId' | 'displayName' | 'templateId'
>;

function nodeDisplayName(node: Node, nodeId: string): string {
  if ('name' in node && node.name) {
    return String(LocalizedString.lookup(node.name, LocalizedString.EN_US) || nodeId);
  }
  return nodeId;
}

function isSceneItemNode(nodeId: string, node: Node): boolean {
  return isWorldSceneItemNode(nodeId, node);
}

type JbcWorldItemSortable = Pick<JbcCatalogItem, 'nodeId' | 'displayName'>;

function jbcWorldItemSortKey(entry: JbcWorldItemSortable): [number, number, string] {
  const can = /^can(\d+)$/i.exec(entry.nodeId);
  if (can) return [0, parseInt(can[1], 10), ''];
  const ream = /^ream(\d+)$/i.exec(entry.nodeId);
  if (ream) return [1, parseInt(ream[1], 10), ''];
  return [2, 0, entry.displayName.toLowerCase()];
}

/** Cans and reams by number, then everything else alphabetically. */
export function compareJbcWorldItemOrder(
  a: JbcWorldItemSortable,
  b: JbcWorldItemSortable
): number {
  const ka = jbcWorldItemSortKey(a);
  const kb = jbcWorldItemSortKey(b);
  if (ka[0] !== kb[0]) return ka[0] - kb[0];
  if (ka[1] !== kb[1]) return ka[1] - kb[1];
  return ka[2].localeCompare(kb[2]);
}

/** Objects listed in the World panel for the given scene (e.g. JBC Sandbox). */
export function worldItemsFromScene(scene: Scene): WorldSceneItem[] {
  const items: WorldSceneItem[] = [];
  for (const [nodeId, node] of Object.entries(scene.nodes)) {
    if (!isWorldSceneItemNode(nodeId, node)) continue;
    items.push({
      key: nodeId,
      nodeId,
      displayName: nodeDisplayName(node, nodeId),
      templateId: node.type === 'from-jbc-template' ? node.templateId : undefined,
    });
  }
  return items.sort(compareJbcWorldItemOrder);
}

function geometryIdsForNode(node: Node): string[] {
  const ids: string[] = [];
  if (node.type === 'object' && node.geometryId) {
    ids.push(node.geometryId);
  }
  return ids;
}

/** Node ids referenced as string literals in JBC ecmaScript scene scripts. */
export function nodeIdsReferencedInScriptCode(code: string): Set<string> {
  const ids = new Set<string>();
  const patterns = [
    /addOnIntersectionListener\s*\(\s*['"]([^'"]+)['"]/g,
    /addOnIntersectionListener\([^)]+,\s*['"]([^'"]+)['"]\s*\)/g,
    /setNodeVisible\s*\(\s*['"]([^'"]+)['"]/g,
    /scene\.nodes\[['"]([^'"]+)['"]\]/g,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(code)) !== null) {
      ids.add(match[1]);
    }
  }
  return ids;
}

function nodeIdsReferencedInSceneScripts(scene: Scene): Set<string> {
  const ids = new Set<string>();
  for (const script of Object.values(scene.scripts ?? {})) {
    for (const nodeId of nodeIdsReferencedInScriptCode(script.code)) {
      ids.add(nodeId);
    }
  }
  return ids;
}

function geometryDisplayName(node: Node, nodeId: string, geometryId: string): string {
  const nodeName = nodeDisplayName(node, nodeId);
  if (nodeName !== nodeId) return nodeName;
  return geometryId.replace(/_geom$/i, '').replace(/_/g, ' ');
}

const CAN_CIRCLE_COUNT = 12;

function resolveSceneGeometry_(
  scene: Scene,
  geometryId: string
): Geometry | undefined {
  return (
    scene.geometry?.[geometryId] ??
    preBuiltGeometries[geometryId as keyof typeof preBuiltGeometries]
  );
}

function challengesWithCircleNode_(circleNumber: number): JbcChallengeRef[] {
  const nodeId = `circle${circleNumber}`;
  const refs: JbcChallengeRef[] = [];
  (Object.keys(JBC_CHALLENGE_SCENES) as ChallengeName[]).forEach(challengeId => {
    if (!JBC_CHALLENGE_SCENES[challengeId].nodes[nodeId]) return;
    refs.push({
      challengeId,
      challengeName: challengeLabel(challengeId, JBC_CHALLENGES[challengeId]),
    });
  });
  return refs;
}

function appendCanCircleGeometries_(byKey: Map<string, JbcCatalogGeometry>): void {
  const circleGeometry = preBuiltGeometries.circle;
  if (!circleGeometry) return;

  const sampleGeometry = JSON.parse(JSON.stringify(circleGeometry)) as Geometry;

  for (let n = 1; n <= CAN_CIRCLE_COUNT; n++) {
    const nodeId = `circle${n}`;
    if (byKey.has(nodeId)) continue;

    const usedIn = challengesWithCircleNode_(n);
    const sampleNode = createCircleNode(n, undefined, false, false);

    byKey.set(nodeId, {
      key: nodeId,
      geometryId: 'circle',
      displayName: geometryDisplayName(sampleNode, nodeId, 'circle'),
      geometryType: circleGeometry.type,
      nodeId,
      usedIn,
      sourceSceneId:
        usedIn[0]?.challengeId && usedIn[0].challengeId !== 'custom'
          ? usedIn[0].challengeId
          : 'jbc5',
      sampleGeometry,
      sampleNode: JSON.parse(JSON.stringify(sampleNode)) as Node,
    });
  }
}

function buildGeometryCatalog(): JbcCatalogGeometry[] {
  const byKey = new Map<string, JbcCatalogGeometry>();

  (Object.keys(JBC_CHALLENGE_SCENES) as ChallengeName[]).forEach(challengeId => {
    const scene = JBC_CHALLENGE_SCENES[challengeId];
    const ref: JbcChallengeRef = {
      challengeId,
      challengeName: challengeLabel(challengeId, JBC_CHALLENGES[challengeId]),
    };

    for (const nodeId of nodeIdsReferencedInSceneScripts(scene)) {
      const node = scene.nodes[nodeId];
      if (!node) continue;

      let geometryId: string | undefined;
      if (node.type === 'object' && node.geometryId) {
        geometryId = node.geometryId;
      } else if (node.type === 'from-jbc-template' && node.templateId === 'circle') {
        geometryId = 'circle';
      } else {
        continue;
      }

      const geometry = resolveSceneGeometry_(scene, geometryId);
      if (!geometry) continue;

      const existing = byKey.get(nodeId);
      if (existing) {
        if (!existing.usedIn.some(r => r.challengeId === challengeId)) {
          existing.usedIn.push(ref);
        }
        continue;
      }

      byKey.set(nodeId, {
        key: nodeId,
        geometryId,
        displayName: geometryDisplayName(node, nodeId, geometryId),
        geometryType: geometry.type,
        nodeId,
        usedIn: [ref],
        sourceSceneId: challengeId,
        sampleGeometry: JSON.parse(JSON.stringify(geometry)) as Geometry,
        sampleNode: JSON.parse(JSON.stringify(node)) as Node,
      });
    }
  });

  appendCanCircleGeometries_(byKey);

  return Array.from(byKey.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );
}

/** Node ids for world items and script geometries on the mat. */
export function placementVisibleNodeIds(placement: {
  worldItemKeys: string[];
  geometryKeys: string[];
}): string[] {
  const ids = new Set(placement.worldItemKeys);
  for (const key of placement.geometryKeys) {
    const entry = JBC_CATALOG_GEOMETRIES.find(g => g.key === key);
    if (entry) ids.add(entry.nodeId);
  }
  return Array.from(ids);
}

function buildItemCatalog(): JbcCatalogItem[] {
  const itemsByNodeId = new Map<string, JbcCatalogItem>();

  (Object.keys(JBC_CHALLENGE_SCENES) as ChallengeName[]).forEach(challengeId => {
    const scene = JBC_CHALLENGE_SCENES[challengeId];
    const ref: JbcChallengeRef = {
      challengeId,
      challengeName: challengeLabel(challengeId, JBC_CHALLENGES[challengeId]),
    };

    Object.entries(scene.nodes).forEach(([nodeId, node]) => {
      if (!isSceneItemNode(nodeId, node)) return;

      const displayName = nodeDisplayName(node, nodeId);
      const templateId =
        node.type === 'from-jbc-template' ? node.templateId : undefined;

      const existing = itemsByNodeId.get(nodeId);
      if (existing) {
        existing.usedIn.push(ref);
        return;
      }

      itemsByNodeId.set(nodeId, {
        key: nodeId,
        nodeId,
        displayName,
        templateId,
        usedIn: [ref],
        sourceSceneId: challengeId,
        sampleNode: JSON.parse(JSON.stringify(node)) as Node,
      });
    });
  });

  return Array.from(itemsByNodeId.values()).sort(compareJbcWorldItemOrder);
}

function setWorldItemVisibility_(scene: Scene, nodeId: string, visible: boolean): void {
  const node = scene.nodes[nodeId];
  if (!node || !isWorldSceneItemNode(nodeId, node)) return;
  if ('visible' in node) {
    (node as Node.Obj).visible = visible;
  }
  if (visible) {
    node.editable = true;
  }
}

function customMarkerMaterial_(material: Node.Obj['material']): Node.Obj['material'] {
  if (material?.type !== 'pbr') return material;
  return {
    type: 'basic',
    color:
      material.albedo ??
      material.emissive ??
      material.ambient ??
      material.reflection ?? {
        type: 'color3',
        color: Color.rgb(255, 255, 255),
      },
  };
}

function catalogGeometryVisible_(
  entry: JbcCatalogGeometry,
  options: CatalogGeometryVisibilityOptions
): boolean {
  if (options.showMarkers !== undefined) {
    return options.showMarkers;
  }
  return entry.nodeId !== START_BOX_NODE_ID || options.showStartBox === true;
}

/**
 * Show/hide sandbox world items while authoring play zones.
 * active: only the active zone's items are visible in the simulator.
 * all: every zone's items are visible (used when saving the challenge).
 */
export function applyJbcCatalogGeometriesToScene(
  scene: Scene,
  selectedGeometryKeys: ReadonlySet<string>,
  options: CatalogGeometryVisibilityOptions = {}
): Scene {
  const next = JSON.parse(JSON.stringify(scene)) as Scene;

  for (const key of selectedGeometryKeys) {
    const entry = JBC_CATALOG_GEOMETRIES.find(g => g.key === key);
    if (!entry) continue;

    if (!next.geometry[entry.geometryId]) {
      next.geometry[entry.geometryId] = JSON.parse(
        JSON.stringify(entry.sampleGeometry)
      ) as Geometry;
    }

    const placed = JSON.parse(JSON.stringify(entry.sampleNode)) as Node;
    if (placed.type === 'object' && placed.material?.type === 'pbr') {
      placed.material = customMarkerMaterial_(placed.material);
    }
    if ('visible' in placed) {
      (placed as Node.Obj).visible = catalogGeometryVisible_(entry, options);
    }
    next.nodes[entry.nodeId] = placed;
  }

  return next;
}

export function ensurePlayZoneGeometriesInScene(
  scene: Scene,
  geometryKeys: ReadonlySet<string>,
  options: CatalogGeometryVisibilityOptions = {}
): Scene {
  const missing = [...geometryKeys].filter(key => {
    const entry = JBC_CATALOG_GEOMETRIES.find(g => g.key === key);
    return entry && !scene.nodes[entry.nodeId];
  });
  if (missing.length === 0) return scene;
  return applyJbcCatalogGeometriesToScene(scene, new Set(missing), options);
}

/** Show/hide sandbox world items for mat placement (all selected items visible). */
export function applySandboxMatPlacementToScene(
  scene: Scene,
  placement: { worldItemKeys: string[]; geometryKeys: string[] },
  options: CatalogGeometryVisibilityOptions = { showStartBox: true }
): Scene {
  const geometryKeySet = new Set(placement.geometryKeys);
  let next = JSON.parse(JSON.stringify(scene)) as Scene;
  next = ensurePlayZoneGeometriesInScene(next, geometryKeySet, options);

  const visibleIds = new Set(placementVisibleNodeIds(placement));

  for (const nodeId of Object.keys(next.nodes)) {
    const node = next.nodes[nodeId];
    if (!isWorldSceneItemNode(nodeId, node)) continue;
    setWorldItemVisibility_(next, nodeId, visibleIds.has(nodeId));
  }

  for (const key of placement.geometryKeys) {
    const entry = JBC_CATALOG_GEOMETRIES.find(g => g.key === key);
    if (entry && next.nodes[entry.nodeId] && 'visible' in next.nodes[entry.nodeId]) {
      (next.nodes[entry.nodeId] as Node.Obj).visible =
        visibleIds.has(entry.nodeId) &&
        catalogGeometryVisible_(entry, options);
    }
  }

  return next;
}

/** Apply mat placement to a saved custom scene (geometries + world items). */
export function applyCustomChallengeMatPlacementToScene(
  scene: Scene,
  placement: { worldItemKeys: string[]; geometryKeys: string[] },
  options: { authoringPreview?: boolean } = {}
): Scene {
  const keys = new Set(placement.worldItemKeys);
  const geometryKeys = new Set(placement.geometryKeys);
  const geometryOptions = {
    showMarkers: options.authoringPreview === true,
    showStartBox: options.authoringPreview === true,
  };

  let next = applySandboxMatPlacementToScene(scene, placement, geometryOptions);

  if (geometryKeys.size > 0) {
    next = applyJbcCatalogGeometriesToScene(next, geometryKeys, geometryOptions);
  }

  const missing = [...keys].filter(key => !next.nodes[key]);
  if (missing.length > 0) {
    next = applyJbcCatalogItemsToScene(next, new Set(missing));
  }

  return next;
}

/** @deprecated Use {@link applySandboxMatPlacementToScene} */
export function applyPlayZoneItemsToSandboxScene(
  scene: Scene,
  _playZones: Array<{ id: string; itemKeys?: string[]; geometryKeys?: string[] }>,
  _mode: 'active' | 'all',
  _activeZoneId?: string
): Scene {
  return applySandboxMatPlacementToScene(scene, { worldItemKeys: [], geometryKeys: [] });
}

/** @deprecated Use {@link applyCustomChallengeMatPlacementToScene} */
export function applyPlayZoneItemsToCustomScene(
  scene: Scene,
  _playZones: Array<{ itemKeys?: string[]; geometryKeys?: string[] }>
): Scene {
  return scene;
}

/** Copy selected scene items from official JBC scenes into a sandbox-based custom scene. */
export function applyJbcCatalogItemsToScene(
  scene: Scene,
  selectedItemKeys: ReadonlySet<string>
): Scene {
  const next = JSON.parse(JSON.stringify(scene)) as Scene;

  for (const key of selectedItemKeys) {
    const item = JBC_CATALOG_ITEMS.find(i => i.key === key);
    if (!item) continue;

    const sourceScene = JBC_CHALLENGE_SCENES[item.sourceSceneId];
    const sourceNode = sourceScene.nodes[item.nodeId];
    if (!sourceNode) continue;

    for (const geometryId of geometryIdsForNode(sourceNode)) {
      const geometry = sourceScene.geometry?.[geometryId];
      if (geometry && !next.geometry[geometryId]) {
        next.geometry[geometryId] = JSON.parse(JSON.stringify(geometry)) as Geometry;
      }
    }

    const placed = JSON.parse(JSON.stringify(sourceNode)) as Node;
    placed.editable = true;
    if ('visible' in placed) {
      (placed as Node.Obj).visible = true;
    }

    next.nodes[item.nodeId] = placed;
  }

  return next;
}

function buildCatalog(): {
  events: JbcCatalogEvent[];
  successGoals: JbcCatalogSuccessGoal[];
} {
  const eventsById = new Map<string, JbcCatalogEvent>();
  const successGoals: JbcCatalogSuccessGoal[] = [];

  (Object.keys(JBC_CHALLENGES) as ChallengeName[]).forEach(challengeId => {
    const challenge = JBC_CHALLENGES[challengeId];
    const ref: JbcChallengeRef = {
      challengeId,
      challengeName: challengeLabel(challengeId, challenge),
    };

    Object.entries(challenge.events).forEach(([eventId, event]) => {
      const existing = eventsById.get(eventId);
      if (existing) {
        existing.usedIn.push(ref);
        return;
      }
      eventsById.set(eventId, {
        eventId,
        event,
        displayName: eventDisplayName(event),
        usedIn: [ref],
      });
    });

    challenge.successGoals?.forEach(goal => {
      const eventId = goal.exprId.replace(/Once$/, '');
      const latchOnce = goal.exprId.endsWith('Once');
      successGoals.push({
        key: `${challengeId}:${goal.exprId}`,
        eventId,
        label: String(LocalizedString.lookup(goal.name, LocalizedString.EN_US) || ''),
        latchOnce,
        source: ref,
      });
    });
  });

  const events = Array.from(eventsById.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );

  successGoals.sort((a, b): number => {
    const byChallenge: number = a.source.challengeName.localeCompare(b.source.challengeName);
    if (byChallenge !== 0) {
      return byChallenge;
    }
    return a.label.localeCompare(b.label);
  });

  return { events, successGoals };
}

const catalog = buildCatalog();
const itemCatalog = buildItemCatalog();
const geometryCatalog = buildGeometryCatalog();

export const JBC_CATALOG_EVENTS = catalog.events;
export const JBC_CATALOG_SUCCESS_GOALS = catalog.successGoals;
export const JBC_CATALOG_ITEMS = itemCatalog;
export const JBC_CATALOG_GEOMETRIES = geometryCatalog;

export function getJbcChallengeDefinition(challengeId: ChallengeName): Challenge {
  return JBC_CHALLENGES[challengeId];
}
