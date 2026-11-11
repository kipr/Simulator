import Scene from '../state/State/Scene';
import Node from '../state/State/Scene/Node';
import Dict from './objectOps/Dict';

/** True when two nodes differ only by origin / startingOrigin (gizmo or physics drag). */
function isOriginOnlyNodeUpdate(prev: Node, next: Node): boolean {
  if (prev === next) return true;
  if (prev.type !== next.type) return false;

  const prevRest = { ...prev } as Record<string, unknown>;
  const nextRest = { ...next } as Record<string, unknown>;
  delete prevRest.origin;
  delete prevRest.startingOrigin;
  delete nextRest.origin;
  delete nextRest.startingOrigin;

  const prevKeys = Object.keys(prevRest).sort();
  const nextKeys = Object.keys(nextRest).sort();
  if (prevKeys.length !== nextKeys.length) return false;
  for (let i = 0; i < prevKeys.length; i++) {
    if (prevKeys[i] !== nextKeys[i]) return false;
    if (prevRest[prevKeys[i]] !== nextRest[nextKeys[i]]) return false;
  }
  return true;
}

/**
 * Whether a Redux scene update should trigger `Space.scene = …` (full simulator reload).
 * Pose-only updates from the physics loop (robot / gizmo-selected node) are skipped;
 * the simulator already owns those transforms.
 */
export function scenePropsRequireSimulatorReload(prev: Scene, next: Scene): boolean {
  if (prev === next) return false;

  if (prev.camera !== next.camera) return true;
  if (prev.scripts !== next.scripts) return true;
  if (prev.geometry !== next.geometry) return true;
  if (prev.gravity !== next.gravity) return true;
  if (prev.selectedNodeId !== next.selectedNodeId) return true;
  if (prev.selectedScriptId !== next.selectedScriptId) return true;
  if (prev.matPlayZones !== next.matPlayZones) return true;
  if (prev.matPlayArea !== next.matPlayArea) return true;
  if (prev.customChallengePlacement !== next.customChallengePlacement) return true;
  if (prev.customChallengeItemSuccessChoices !== next.customChallengeItemSuccessChoices) return true;
  if (prev.predefinedLocations !== next.predefinedLocations) return true;
  if (prev.hdriUri !== next.hdriUri) return true;

  const robotIds = new Set(Dict.keySet(Scene.robots(next)));
  const prevNodes = prev.nodes;
  const nextNodes = next.nodes;

  const prevNodeIds = Dict.keySet(prevNodes);
  const nextNodeIds = Dict.keySet(nextNodes);
  if (prevNodeIds.size !== nextNodeIds.size) return true;

  const selectedId = next.selectedNodeId;

  for (const id of nextNodeIds) {
    if (robotIds.has(id)) continue;
    const prevNode = prevNodes[id];
    const nextNode = nextNodes[id];
    if (prevNode === nextNode) continue;
    if (!prevNode) return true;
    if (id === selectedId && isOriginOnlyNodeUpdate(prevNode, nextNode)) continue;
    return true;
  }

  return false;
}

/** True when Redux only changed which node/script is selected (plus ignored robot poses). */
export function isSelectionOnlySceneUpdate(prev: Scene, next: Scene): boolean {
  if (prev === next) return false;
  if (
    prev.selectedNodeId === next.selectedNodeId &&
    prev.selectedScriptId === next.selectedScriptId
  ) {
    return false;
  }
  return !scenePropsRequireSimulatorReload(
    {
      ...prev,
      selectedNodeId: next.selectedNodeId,
      selectedScriptId: next.selectedScriptId,
    },
    next
  );
}
