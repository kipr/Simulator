import Dict from '../../../util/objectOps/Dict';
import Geometry from './Geometry';
import Node from './Node';
import Script from './Script';
import { ReferenceFramewUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { RawVector2 } from '../../../util/math/math';
import Camera from './Camera';
import Patch from '../../../util/redux/Patch';
import Async from '../Async';
import LocalizedString from '../../../util/LocalizedString';
import Author from '../../../db/Author';
import { CustomChallengeDefinition } from '../../../util/customChallengeStorage';

export interface MatPlayAreaDefinition {
  corners: [RawVector2, RawVector2, RawVector2, RawVector2];
}

export type MatPlayAreaEdgeMode = 'straight' | 'curved';

export interface MatPlayZoneDefinition {
  id: string;
  name: string;
  /** Polygon vertices in mat-local cm (clockwise). */
  points: RawVector2[];
  edgeMode?: MatPlayAreaEdgeMode;
  /** @deprecated Use points; four-corner rectangles from older saves. */
  corners?: [RawVector2, RawVector2, RawVector2, RawVector2];
  /** @deprecated Items are stored in {@link CustomChallengePlacement}, not per zone. */
  itemNodeIds?: string[];
  /** @deprecated Geometries are stored in {@link CustomChallengePlacement}, not per zone. */
  scriptGeometryIds?: string[];
  successGoalKeys: string[];
}

/** World items and script geometries on the mat (not tied to play zones). */
export interface CustomChallengePlacement {
  worldItemNodeIds: string[];
  scriptGeometryIds: string[];
}

export interface PredefinedLocation {
  id: string;
  name: LocalizedString;
  origin: ReferenceFramewUnits;
}

interface Scene {
  name: LocalizedString;
  author: Author;
  description: LocalizedString;
  selectedNodeId?: string;
  selectedScriptId?: string;

  hdriUri?: string;

  geometry: Dict<Geometry>;
  nodes: Dict<Node>;
  scripts?: Dict<Script>;

  camera: Camera;

  gravity: Vector3wUnits;

  predefinedLocations?: Dict<PredefinedLocation>;

  /** @deprecated Single play region; use matPlayZones. */
  matPlayArea?: MatPlayAreaDefinition;

  /** Play zones on the JBC mat (custom challenges). */
  matPlayZones?: MatPlayZoneDefinition[];

  /** Items/geometries placed on the mat for custom challenges. */
  customChallengePlacement?: CustomChallengePlacement;

  /** Per-item success outcomes from the custom challenge wizard (for runtime script refresh). */
  customChallengeItemSuccessChoices?: Record<string, string>;

  /** Success/failure rules and starter code (custom JBC challenges live in the scene collection). */
  customChallenge?: CustomChallengeDefinition;

  /** Classroom-shared copy; students can play but not edit challenge setup. */
  customChallengeReadOnly?: boolean;

  customChallengeClassroomShare?: {
    classroomDocId: string;
    teacherId: string;
  };
}

export type SceneBrief = Pick<Scene, 'name' | 'author' | 'description'>;

export namespace SceneBrief {
  export const fromScene = (scene: Scene): SceneBrief => ({
    name: scene.name,
    description: scene.description,
    author: scene.author,
  });
}

export type AsyncScene = Async<SceneBrief, Scene>;

export namespace AsyncScene {
  export const unloaded = (brief: SceneBrief): AsyncScene => ({
    type: Async.Type.Unloaded,
    brief,
  });

  export const loaded = (scene: Scene): AsyncScene => ({
    type: Async.Type.Loaded,
    brief: {
      name: scene.name,
      description: scene.description,
      author: scene.author,
    },
    value: scene,
  });
}

export interface PatchScene {
  name: Patch<LocalizedString>;
  author: Patch<Author>;
  description: Patch<LocalizedString>;
  selectedNodeId: Patch<string>;
  selectedScriptId: Patch<string>;

  hdriUri?: Patch<string>;

  geometry: Dict<Patch<Geometry>>;
  nodes: Dict<Patch<Node>>;
  scripts?: Dict<Patch<Script>>;

  camera: Patch<Camera>;

  gravity: Patch<Vector3wUnits>;

  predefinedLocations?: Dict<Patch<PredefinedLocation>>;

  matPlayArea?: Patch<MatPlayAreaDefinition>;
  matPlayZones?: Patch<MatPlayZoneDefinition[]>;
  customChallengePlacement?: Patch<CustomChallengePlacement>;
  customChallengeItemSuccessChoices?: Patch<Record<string, string>>;
  customChallenge?: Patch<CustomChallengeDefinition>;
}

namespace Scene {
  export const robots = (scene: Scene): Dict<Node.Robot> => {
    const robots: Dict<Node.Robot> = {};
    for (const id in scene.nodes) {
      const node = scene.nodes[id];
      if (node.type !== 'robot') continue;
      robots[id] = node;
    }
    return robots;
  };

  export const nodeOrdering = (scene: Scene): string[] => {
    // Find nodes with no parent
    const rootNodes = Object.keys(scene.nodes).filter(n => {
      const node = scene.nodes[n];

      return node.type === 'robot' || !node.parentId;
    });

    const children = new Map<string, string[]>();
    for (const nodeId of Object.keys(scene.nodes)) {
      const node = scene.nodes[nodeId];
      if (node.type === 'robot') continue;
      if (!node.parentId) continue;
      children.set(node.parentId, ([...(children.get(node.parentId) || []), nodeId]));
    }

    const queue = [...rootNodes];
    const visited = new Set<string>();
    const ret: string[] = [];
    

    while (queue.length > 0) {
      const next = queue.shift();
      if (visited.has(next)) continue;
      visited.add(next);

      ret.push(next);

      const c = children.get(next);
      if (c) ret.push(...c);
    }
    
    return ret;
  };

  export const setNode = (scene: Scene, nodeId: string, node: Node): Scene => ({
    ...scene,
    nodes: {
      ...scene.nodes,
      [nodeId]: node,
    },
  });

  /** Snapshot `origin` into `startingOrigin` when missing (custom challenges / editor-placed items). */
  export const ensureStartingOrigins = (scene: Scene): Scene => {
    let nodes = { ...scene.nodes };
    let changed = false;
    for (const nodeId of Object.keys(nodes)) {
      const node = nodes[nodeId];
      if (node.startingOrigin || !node.origin) continue;
      changed = true;
      nodes = {
        ...nodes,
        [nodeId]: {
          ...node,
          startingOrigin: {
            position: node.origin.position,
            orientation: node.origin.orientation,
            scale: node.origin.scale,
          },
        },
      };
    }
    return changed ? { ...scene, nodes } : scene;
  };

  /** Restore every node's `origin` from `startingOrigin` (challenge reset / soft reset). */
  export const resetNodeOriginsToStarting = (scene: Scene): Scene => {
    const withStarting = ensureStartingOrigins(scene);
    let nodes = { ...withStarting.nodes };
    for (const nodeId of Object.keys(nodes)) {
      const node = nodes[nodeId];
      const { startingOrigin } = node;
      if (!startingOrigin) continue;
      nodes = {
        ...nodes,
        [nodeId]: {
          ...node,
          origin: {
            position: startingOrigin.position,
            orientation: startingOrigin.orientation,
            scale: startingOrigin.scale,
          },
        },
      };
    }
    return { ...scene, nodes };
  };

  export const addObject = (scene: Scene, nodeId: string, obj: Node.Obj, geometry: Geometry): Scene => ({
    ...scene,
    nodes: {
      ...scene.nodes,
      [nodeId]: obj,
    },
    geometry: {
      ...scene.geometry,
      [obj.geometryId]: geometry,
    },
  });

  export const removeNode = (scene: Scene, nodeId: string): Scene => {
    const nodes = { ...scene.nodes };
    delete nodes[nodeId];
    return {
      ...scene,
      nodes,
    };
  };

  export const setGravity = (scene: Scene, gravity: Vector3wUnits): Scene => ({
    ...scene,
    gravity,
  });

  export const setCamera = (scene: Scene, camera: Camera): Scene => ({
    ...scene,
    camera,
  });

  export const setGeometry = (scene: Scene, geometryId: string, geometry: Geometry): Scene => ({
    ...scene,
    geometry: {
      ...scene.geometry,
      [geometryId]: geometry,
    },
  });

  export const removeGeometry = (scene: Scene, geometryId: string): Scene => {
    const geometry = { ...scene.geometry };
    delete geometry[geometryId];
    return {
      ...scene,
      geometry,
    };
  };

  export const setScript = (scene: Scene, scriptId: string, script: Script): Scene => ({
    ...scene,
    scripts: {
      ...scene.scripts,
      [scriptId]: script,
    },
  });

  export const removeScript = (scene: Scene, scriptId: string): Scene => {
    const scripts = { ...scene.scripts };
    delete scripts[scriptId];
    return {
      ...scene,
      scripts,
    };
  };

  export const diff = (a: Scene, b: Scene): PatchScene => {
    const predefinedLocationsDiff = (a.predefinedLocations || b.predefinedLocations) 
      ? Patch.diffDict(a.predefinedLocations || {}, b.predefinedLocations || {}, (prev, next) => 
        Patch.diff(prev, next)
      )
      : undefined;

    return {
      name: Patch.diff(a.name, b.name),
      author: Patch.diff(a.author, b.author),
      description: Patch.diff(a.description, b.description),
      hdriUri: Patch.diff(a.hdriUri, b.hdriUri),
      selectedNodeId: Patch.diff(a.selectedNodeId, b.selectedNodeId),
      selectedScriptId: Patch.diff(a.selectedScriptId, b.selectedScriptId),
      geometry: Patch.diffDict(a.geometry, b.geometry, Geometry.diff),
      nodes: Patch.diffDict(a.nodes, b.nodes, Node.diff),
      scripts: Patch.diffDict(a.scripts || {}, b.scripts || {}, Patch.diff),
      camera: Camera.diff(a.camera, b.camera),
      gravity: Patch.diff(a.gravity, b.gravity),
      predefinedLocations: predefinedLocationsDiff,
      matPlayArea: Patch.diff(a.matPlayArea, b.matPlayArea),
      matPlayZones: Patch.diff(a.matPlayZones, b.matPlayZones),
      customChallengePlacement: Patch.diff(a.customChallengePlacement, b.customChallengePlacement),
      customChallengeItemSuccessChoices: Patch.diff(
        a.customChallengeItemSuccessChoices,
        b.customChallengeItemSuccessChoices
      ),
      customChallenge: Patch.diff(a.customChallenge, b.customChallenge),
    };
  };

  export const apply = (scene: Scene, patch: PatchScene): Scene => ({
    name: Patch.apply(patch.name, scene.name),
    description: Patch.apply(patch.description, scene.description),
    author: Patch.apply(patch.author, scene.author),
    hdriUri: Patch.apply(patch.hdriUri, scene.hdriUri),
    selectedNodeId: Patch.apply(patch.selectedNodeId, scene.selectedNodeId),
    selectedScriptId: Patch.apply(patch.selectedScriptId, scene.selectedScriptId),
    camera: Patch.apply(patch.camera, scene.camera),
    gravity: Patch.apply(patch.gravity, scene.gravity),
    nodes: Patch.applyDict(patch.nodes, scene.nodes),
    geometry: Patch.applyDict(patch.geometry, scene.geometry),
    scripts: Patch.applyDict(patch.scripts, scene.scripts || {}),
    predefinedLocations: patch.predefinedLocations 
      ? Patch.applyDict(patch.predefinedLocations, scene.predefinedLocations || {})
      : scene.predefinedLocations,
    matPlayArea: Patch.apply(patch.matPlayArea, scene.matPlayArea),
    matPlayZones: Patch.apply(patch.matPlayZones, scene.matPlayZones),
    customChallengePlacement: Patch.apply(
      patch.customChallengePlacement,
      scene.customChallengePlacement
    ),
    customChallengeItemSuccessChoices: Patch.apply(
      patch.customChallengeItemSuccessChoices,
      scene.customChallengeItemSuccessChoices
    ),
    customChallenge: Patch.apply(patch.customChallenge, scene.customChallenge),
  });

  export const EMPTY: Scene = {
    author: Author.user(''),
    description: { [LocalizedString.EN_US]: '' },
    geometry: {},
    name: { [LocalizedString.EN_US]: '' },
    nodes: {},
    camera: Camera.NONE,
    gravity: Vector3wUnits.zero('meters'),
  };
}

export default Scene;
