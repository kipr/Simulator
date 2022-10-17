import Scene from "../State/Scene";
import { Scenes } from "../State";
import Async from "../State/Async";
import * as JBC_SCENES from '../../scenes';
import construct from '../../util/construct';
import Geometry from '../State/Scene/Geometry';
import Node from '../State/Scene/Node';
import Camera from '../State/Scene/Camera';
import { ReferenceFrame } from '../../unit-math';

export namespace ScenesAction {
  export interface RemoveScene {
    type: 'scenes/remove-scene';
    id: string;
  }

  export const removeScene = construct<RemoveScene>('scenes/remove-scene');

  export interface SetScene {
    type: 'scenes/set-scene';
    sceneId: string;
    scene: Scene;
  }

  export const setScene = construct<SetScene>('scenes/set-scene');

  export interface SetSceneBatch {
    type: 'scenes/set-scene-batch';
    sceneIds: {
      id: string;
      scene: Scene;
    }[];
  }

  export const setSceneBatch = construct<SetSceneBatch>('scenes/set-scene-batch');

  export interface LoadScene {
    type: 'scenes/load-scene';
    sceneId: string;
  }

  export const loadScene = construct<LoadScene>('scenes/load-scene');

  export interface ResetScene {
    type: 'scenes/reset-scene';
    sceneId: string;
  }

  export const resetScene = construct<ResetScene>('scenes/reset-scene');

  export interface RemoveNode {
    type: 'scenes/remove-node';
    sceneId: string;
    nodeId: string;
  }

  export const removeNode = construct<RemoveNode>('scenes/remove-node');

  export interface SetNode {
    type: 'scenes/set-node';
    sceneId: string;
    nodeId: string;
    node: Node;
  }


  export const setNode = construct<SetNode>('scenes/set-node');

  export interface SetNodeBatch {
    type: 'scenes/set-node-batch';
    sceneId: string;
    nodeIds: {
      id: string;
      node: Node;
    }[];
  }

  export const setNodeBatch = construct<SetNodeBatch>('scenes/set-node-batch');

  export interface AddGeometry {
    type: 'scenes/add-geometry';
    sceneId: string;
    geometryId: string;
    geometry: Geometry;
  }

  export const addGeometry = construct<AddGeometry>('scenes/add-geometry');

  export interface RemoveGeometry {
    type: 'scenes/remove-geometry';
    sceneId: string;
    geometryId: string;
  }

  export const removeGeometry = construct<RemoveGeometry>('scenes/remove-geometry');

  export interface SetGeometry {
    type: 'scenes/set-geometry';
    sceneId: string;
    geometryId: string;
    geometry: Geometry;
  }
  
  export const setGeometry = construct<SetGeometry>('scenes/set-geometry');

  export interface SetGeometryBatch {
    type: 'scenes/set-geometry-batch';
    sceneId: string;
    geometryIds: {
      id: string;
      geometry: Geometry;
    }[];
  }

  export const setGeometryBatch = construct<SetGeometryBatch>('scenes/set-geometry-batch');

  export interface SelectNode {
    type: 'scenes/select-node';
    sceneId: string;
    nodeId?: string;
  }

  export const selectNode = construct<SelectNode>('scenes/select-node');

  export interface AddObject {
    type: 'scenes/add-object';
    sceneId: string;
    nodeId: string;
    object: Node.Obj;
    geometry: Geometry;
  }

  export const addObject = construct<AddObject>('scenes/add-object');

  export interface SetCamera {
    type: 'scenes/set-camera';
    sceneId: string;
    camera: Camera;
  }

  export const setCamera = construct<SetCamera>('scenes/set-camera');

  export interface SetNodeOrigin {
    type: 'scenes/set-node-origin';
    sceneId: string;
    nodeId: string;
    origin: ReferenceFrame;
  }

  export const setNodeOrigin = construct<SetNodeOrigin>('scenes/set-node-origin');
}

export type ScenesAction = (
  ScenesAction.RemoveScene |
  ScenesAction.SetScene |
  ScenesAction.SetSceneBatch |
  ScenesAction.LoadScene |
  ScenesAction.ResetScene |
  ScenesAction.RemoveNode |
  ScenesAction.SetNode |
  ScenesAction.SetNodeBatch |
  ScenesAction.AddGeometry |
  ScenesAction.RemoveGeometry |
  ScenesAction.SetGeometry |
  ScenesAction.SetGeometryBatch |
  ScenesAction.SelectNode |
  ScenesAction.AddObject |
  ScenesAction.SetCamera |
  ScenesAction.SetNodeOrigin
);

const DEFAULT_SCENES: Scenes = {
  jbcSandboxA: Async.loaded({ value: JBC_SCENES.JBC_Sandbox_A }),
  jbcSandboxB: Async.loaded({ value: JBC_SCENES.JBC_Sandbox_B }),
  jbc1: Async.loaded({ value: JBC_SCENES.JBC_1 }),
  jbc2: Async.loaded({ value: JBC_SCENES.JBC_2 }),
  jbc2b: Async.loaded({ value: JBC_SCENES.JBC_2B }),
  jbc2c: Async.loaded({ value: JBC_SCENES.JBC_2C }),
  jbc2d: Async.loaded({ value: JBC_SCENES.JBC_2D }),
  jbc3: Async.loaded({ value: JBC_SCENES.JBC_3 }),
  jbc3b: Async.loaded({ value: JBC_SCENES.JBC_3B }),
  jbc3c: Async.loaded({ value: JBC_SCENES.JBC_3C }),
  jbc4: Async.loaded({ value: JBC_SCENES.JBC_4 }),
  jbc4b: Async.loaded({ value: JBC_SCENES.JBC_4B }),
  jbc5: Async.loaded({ value: JBC_SCENES.JBC_5 }),
  jbc5b: Async.loaded({ value: JBC_SCENES.JBC_5B }),
  jbc5c: Async.loaded({ value: JBC_SCENES.JBC_5C }),
  jbc6: Async.loaded({ value: JBC_SCENES.JBC_6 }),
  jbc6b: Async.loaded({ value: JBC_SCENES.JBC_6B }),
  jbc6c: Async.loaded({ value: JBC_SCENES.JBC_6C }),
  jbc7: Async.loaded({ value: JBC_SCENES.JBC_7 }),
  jbc7b: Async.loaded({ value: JBC_SCENES.JBC_7B }),
  jbc8: Async.loaded({ value: JBC_SCENES.JBC_8 }),
  jbc8b: Async.loaded({ value: JBC_SCENES.JBC_8B }),
  jbc9: Async.loaded({ value: JBC_SCENES.JBC_9 }),
  jbc9b: Async.loaded({ value: JBC_SCENES.JBC_9B }),
  jbc10: Async.loaded({ value: JBC_SCENES.JBC_10 }),
  jbc10b: Async.loaded({ value: JBC_SCENES.JBC_10B }),
  jbc12: Async.loaded({ value: JBC_SCENES.JBC_12 }),
  jbc13: Async.loaded({ value: JBC_SCENES.JBC_13 }),
  jbc15b: Async.loaded({ value: JBC_SCENES.JBC_15B }),
  jbc17: Async.loaded({ value: JBC_SCENES.JBC_17 }),
  jbc17b: Async.loaded({ value: JBC_SCENES.JBC_17B }),
  jbc19: Async.loaded({ value: JBC_SCENES.JBC_19 }),
  jbc20: Async.loaded({ value: JBC_SCENES.JBC_20 }),
  jbc21: Async.loaded({ value: JBC_SCENES.JBC_21 }),
  jbc22: Async.loaded({ value: JBC_SCENES.JBC_22 }),
};

export const reduceScenes = (state: Scenes = DEFAULT_SCENES, action: ScenesAction): Scenes => {
  switch (action.type) {
    case 'scenes/remove-scene': {
      const nextState: Scenes = { ...state };
      delete nextState[action.id];
      return nextState;
    }
    case 'scenes/set-scene': return {
      ...state,
      [action.sceneId]: Async.loaded({ value: action.scene }),
    };
    case 'scenes/set-scene-batch': {
      const nextState: Scenes = { ...state };

      for (const { id, scene } of action.sceneIds) {
        nextState.scenes[id] = Async.loaded({ value: scene });
      }

      return nextState;
    }
    case 'scenes/load-scene': return {
      ...state,
      [action.sceneId]: Async.loading({ brief: Async.brief(state[action.sceneId]) }),
    };
    case 'scenes/reset-scene': return {
      ...state,
      [action.sceneId]: Async.reset(state[action.sceneId]),
    };
    case 'scenes/remove-node': return {
      ...state,
      [action.sceneId]: Async.mutate(state[action.sceneId], scene => {
        delete scene.nodes[action.nodeId];
      }),
    };
    case 'scenes/set-node': return {
      ...state,
      [action.sceneId]: Async.mutate(state[action.sceneId], scene => {
        scene.nodes[action.nodeId] = action.node;
      }),
    };
    case 'scenes/set-node-batch': return {
      ...state,
      [action.sceneId]: Async.mutate(state[action.sceneId], scene => {
        for (const { id, node } of action.nodeIds) {
          scene.nodes[id] = node;
        }
      }),
    };
    case 'scenes/add-geometry': return {
      ...state,
      [action.sceneId]: Async.mutate(state[action.sceneId], scene => {
        scene.geometry[action.geometryId] = action.geometry;
      }),
    };
    case 'scenes/remove-geometry': return {
      ...state,
      [action.sceneId]: Async.mutate(state[action.sceneId], scene => {
        delete scene.geometry[action.geometryId];
      }),
    };
    case 'scenes/set-geometry': return {
      ...state,
      [action.sceneId]: Async.mutate(state[action.sceneId], scene => {
        scene.geometry[action.geometryId] = action.geometry;
      }),
    };
    case 'scenes/set-geometry-batch': return {
      ...state,
      [action.sceneId]: Async.mutate(state[action.sceneId], scene => {
        for (const { id, geometry } of action.geometryIds) {
          scene.geometry[id] = geometry;
        }
      }),
    };
    case 'scenes/select-node': return {
      ...state,
      [action.sceneId]: Async.mutate(state[action.sceneId], scene => {
        scene.selectedNodeId = action.nodeId;
      }),
    };
    case 'scenes/add-object': return {
      ...state,
      [action.sceneId]: Async.mutate(state[action.sceneId], scene => {
        scene.geometry[action.object.geometryId] = action.geometry;
        scene.nodes[action.nodeId] = action.object;
      }),
    };
    case 'scenes/set-camera': return {
      ...state,
      [action.sceneId]: Async.mutate(state[action.sceneId], scene => {
        scene.camera = action.camera;
      }),
    };
    case 'scenes/set-node-origin': return {
      ...state,
      [action.sceneId]: Async.mutate(state[action.sceneId], scene => {
        scene.nodes[action.nodeId].origin = action.origin;
      }),
    };
    default: return state;
  }
};