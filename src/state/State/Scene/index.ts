import Dict from '../../../Dict';
import Geometry from './Geometry';
import Node from './Node';
import Script from './Script';
import { Vector3 } from '../../../unit-math';
import Camera from './Camera';
import Patch from '../../../util/Patch';
import Async from '../Async';
import LocalizedString from '../../../util/LocalizedString';
import Author from '../../../db/Author';

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

  gravity: Vector3;
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

  gravity: Patch<Vector3>;
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

    while (visited.size < Object.keys(scene.nodes).length) {
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

  export const setGravity = (scene: Scene, gravity: Vector3): Scene => ({
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

  export const diff = (a: Scene, b: Scene): PatchScene => ({
    name: Patch.diff(a.name, b.name),
    author: Patch.diff(a.author, b.author),
    description: Patch.diff(a.description, b.description),
    hdriUri: Patch.diff(a.hdriUri, b.hdriUri),
    selectedNodeId: Patch.diff(a.selectedNodeId, b.selectedNodeId),
    selectedScriptId: Patch.diff(a.selectedScriptId, b.selectedScriptId),
    geometry: Patch.diffDict(a.geometry, b.geometry, Geometry.diff),
    nodes: Patch.diffDict(a.nodes, b.nodes, Node.diff),
    scripts: Patch.diffDict(a.scripts, b.scripts, Patch.diff),
    camera: Camera.diff(a.camera, b.camera),
    gravity: Patch.diff(a.gravity, b.gravity),
  });

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
    scripts: Patch.applyDict(patch.scripts, scene.scripts),
  });

  export const EMPTY: Scene = {
    author: Author.user(''),
    description: { [LocalizedString.EN_US]: '' },
    geometry: {},
    name: { [LocalizedString.EN_US]: '' },
    nodes: {},
    camera: Camera.NONE,
    gravity: Vector3.zero('meters'),
  };
}

export default Scene;
