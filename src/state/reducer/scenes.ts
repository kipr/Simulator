import Scene, { AsyncScene, SceneBrief } from "../State/Scene";
import { Scenes } from "../State";
import Async from "../State/Async";
import * as JBC_SCENES from '../../scenes';
import construct from '../../util/construct';
import Geometry from '../State/Scene/Geometry';
import Node from '../State/Scene/Node';
import Camera from '../State/Scene/Camera';
import { ReferenceFrame, Vector3 } from '../../unit-math';
import db from '../../db';
import { SCENE_COLLECTION } from '../../db/constants';
import store from '..';
import Selector from '../../db/Selector';
import Dict from '../../Dict';
import Script from '../State/Scene/Script';
import { errorToAsyncError, mutate } from './util';

export namespace ScenesAction {
  export interface RemoveScene {
    type: 'scenes/remove-scene';
    sceneId: string;
  }

  export const removeScene = construct<RemoveScene>('scenes/remove-scene');

  export interface SetScene {
    type: 'scenes/set-scene';
    sceneId: string;
    scene: Scene;
  }

  export const setScene = construct<SetScene>('scenes/set-scene');

  export interface SetScenePartial {
    type: 'scenes/set-scene-partial';
    sceneId: string;
    partialScene: Partial<Scene>;
  }

  export const setScenePartial = construct<SetScenePartial>('scenes/set-scene-partial');

  export interface SetSceneInternal {
    type: 'scenes/set-scene-internal';
    sceneId: string;
    scene: AsyncScene;
  }

  export const setSceneInternal = construct<SetSceneInternal>('scenes/set-scene-internal');

  export interface SetScenesInternal {
    type: 'scenes/set-scenes-internal';
    scenes: {
      [sceneId: string]: AsyncScene;
    };
  }

  export const setScenesInternal = construct<SetScenesInternal>('scenes/set-scenes-internal');

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

  export interface CreateScene {
    type: 'scenes/create-scene';
    sceneId: string;
    scene: Scene;
  }

  export const createScene = construct<CreateScene>('scenes/create-scene');

  export interface SaveScene {
    type: 'scenes/save-scene';
    sceneId: string;
  }

  export const saveScene = construct<SaveScene>('scenes/save-scene');

  export interface ListUserScenes {
    type: 'scenes/list-user-scenes';
  }

  export const LIST_USER_SCENES: ListUserScenes = { type: 'scenes/list-user-scenes' };

  export interface ResetScene {
    type: 'scenes/reset-scene';
    sceneId: string;
  }

  export const resetScene = construct<ResetScene>('scenes/reset-scene');

  export interface SoftResetScene {
    type: 'scenes/soft-reset-scene';
    sceneId: string;
  }

  export const softResetScene = construct<SoftResetScene>('scenes/soft-reset-scene');

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

  export interface SetGravity {
    type: 'scenes/set-gravity';
    sceneId: string;
    gravity: Vector3;
  }

  export const setGravity = construct<SetGravity>('scenes/set-gravity');

  export interface SetNodeOrigin {
    type: 'scenes/set-node-origin';
    sceneId: string;
    nodeId: string;
    origin: ReferenceFrame;
    updateStarting?: boolean;
  }

  export const setNodeOrigin = construct<SetNodeOrigin>('scenes/set-node-origin');

  export interface UnfailScene {
    type: 'scenes/unfail-scene';
    sceneId: string;
  }

  export const unfailScene = construct<UnfailScene>('scenes/unfail-scene');

  export interface AddScript {
    type: 'scenes/add-script';
    sceneId: string;
    scriptId: string;
    script: Script;
  }

  export const addScript = construct<AddScript>('scenes/add-script');

  export interface RemoveScript {
    type: 'scenes/remove-script';
    sceneId: string;
    scriptId: string;
  }

  export const removeScript = construct<RemoveScript>('scenes/remove-script');

  export interface SetScript {
    type: 'scenes/set-script';
    sceneId: string;
    scriptId: string;
    script: Script;
  }

  export const setScript = construct<SetScript>('scenes/set-script');
}

export type ScenesAction = (
  ScenesAction.RemoveScene |
  ScenesAction.SetScene |
  ScenesAction.SetScenePartial |
  ScenesAction.SetSceneInternal |
  ScenesAction.SetScenesInternal |
  ScenesAction.SetSceneBatch |
  ScenesAction.LoadScene |
  ScenesAction.ResetScene |
  ScenesAction.SoftResetScene |
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
  ScenesAction.SetGravity |
  ScenesAction.SetNodeOrigin |
  ScenesAction.CreateScene |
  ScenesAction.SaveScene |
  ScenesAction.ListUserScenes |
  ScenesAction.UnfailScene |
  ScenesAction.AddScript |
  ScenesAction.RemoveScript |
  ScenesAction.SetScript
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
  scriptPlayground: Async.loaded({ value: JBC_SCENES.scriptPlayground }),
  lightSensorTest: Async.loaded({ value: JBC_SCENES.lightSensorTest }),
};

const create = async (sceneId: string, next: Async.Creating<Scene>) => {
  try {
    await db.set(Selector.scene(sceneId), next.value);
    store.dispatch(ScenesAction.setSceneInternal({
      scene: Async.loaded({
        brief: SceneBrief.fromScene(next.value),
        value: next.value
      }),
      sceneId,
    }));
  } catch (error) {
    store.dispatch(ScenesAction.setSceneInternal({
      scene: Async.createFailed({
        value: next.value,
        error: errorToAsyncError(error),
      }),
      sceneId,
    }));
  }
};

const save = async (sceneId: string, current: Async.Saveable<SceneBrief, Scene>) => {
  try {
    await db.set(Selector.scene(sceneId), current.value);
    store.dispatch(ScenesAction.setSceneInternal({
      scene: Async.loaded({
        brief: current.brief,
        value: current.value
      }),
      sceneId,
    }));
  } catch (error) {
    store.dispatch(ScenesAction.setSceneInternal({
      scene: Async.saveFailed({
        brief: current.brief,
        original: current.original,
        value: current.value,
        error: errorToAsyncError(error),
      }),
      sceneId,
    }));
  }
};

const load = async (sceneId: string, current: AsyncScene | undefined) => {
  const brief = Async.brief(current);
  try {
    const value = await db.get<Scene>(Selector.scene(sceneId));
    store.dispatch(ScenesAction.setSceneInternal({
      scene: Async.loaded({ brief, value }),
      sceneId,
    }));
  } catch (error) {
    store.dispatch(ScenesAction.setSceneInternal({
      scene: Async.loadFailed({ brief, error: errorToAsyncError(error) }),
      sceneId,
    }));
  }
};

const remove = async (sceneId: string, next: Async.Deleting<SceneBrief, Scene>) => {
  try {
    await db.delete(Selector.scene(sceneId));
    store.dispatch(ScenesAction.setSceneInternal({ sceneId, scene: undefined }));
  } catch (error) {
    store.dispatch(ScenesAction.setSceneInternal({
      scene: Async.deleteFailed({ brief: next.brief, value: next.value, error: errorToAsyncError(error) }),
      sceneId,
    }));
  }
};

export const listUserScenes = async () => {
  const scenes = await db.list<Scene>(SCENE_COLLECTION);
  store.dispatch(ScenesAction.setScenesInternal({
    scenes: Dict.map(scenes, scene => Async.loaded({
      brief: SceneBrief.fromScene(scene),
      value: scene
    }))
  }));
};

export const reduceScenes = (state: Scenes = DEFAULT_SCENES, action: ScenesAction): Scenes => {
  switch (action.type) {
    case 'scenes/remove-scene': {
      const current = state[action.sceneId];
      const deleting = Async.deleting({
        brief: Async.brief(current),
        value: Async.latestValue(current)
      });

      void remove(action.sceneId, deleting);

      return {
        ...state,
        [action.sceneId]: deleting,
      };
    }
    case 'scenes/set-scene': {
      const current = state[action.sceneId];

      if (!current) return state;

      if (current.type === Async.Type.Loaded) {
        return {
          ...state,
          [action.sceneId]: Async.saveable({
            brief: current.brief,
            original: current.value,
            value: action.scene,
          })
        };
      }

      if (current.type === Async.Type.Saveable) {
        return {
          ...state,
          [action.sceneId]: Async.saveable({
            brief: current.brief,
            original: current.original,
            value: action.scene,
          })
        };
      }
      
      return state;
    }
    case 'scenes/set-scene-partial': {
      const current = state[action.sceneId];

      if (!current) return state;

      if (current.type === Async.Type.Loaded) {
        return {
          ...state,
          [action.sceneId]: Async.saveable({
            brief: current.brief,
            original: current.value,
            value: {
              ...current.value,
              ...action.partialScene,
            },
          })
        };
      }

      if (current.type === Async.Type.Saveable) {
        return {
          ...state,
          [action.sceneId]: Async.saveable({
            brief: current.brief,
            original: current.original,
            value: {
              ...current.value,
              ...action.partialScene,
            },
          })
        };
      }

      return state;
    }
    case 'scenes/set-scene-internal': return {
      ...state,
      [action.sceneId]: action.scene,
    };
    case 'scenes/set-scenes-internal': {
      const nextState = { ...state };
      for (const sceneId in action.scenes) {
        nextState[sceneId] = action.scenes[sceneId];
      }
      return nextState;
    }
    case 'scenes/set-scene-batch': {
      const nextState: Scenes = { ...state };

      for (const { id, scene } of action.sceneIds) {
        nextState.scenes[id] = Async.loaded({ value: scene });
      }

      return nextState;
    }
    case 'scenes/load-scene': {
      void load(action.sceneId, state[action.sceneId]);
      return {
        ...state,
        [action.sceneId]: Async.loading({ brief: Async.brief(state[action.sceneId]) }),
      };
    }
    case 'scenes/create-scene': {
      const creating = Async.creating({ value: action.scene });
      void create(action.sceneId, creating);
      return {
        ...state,
        [action.sceneId]: creating,
      };
    }
    case 'scenes/save-scene': {
      const current = state[action.sceneId];
      if (current.type !== Async.Type.Saveable) return state;
      void save(action.sceneId, current);
      return {
        ...state,
        [action.sceneId]: Async.saving({
          brief: current.brief,
          original: current.original,
          value: current.value,
        }),
      };
    }
    case 'scenes/soft-reset-scene': {
      const scene = state[action.sceneId];

      if (!scene) return state;

      
      if (scene.type === Async.Type.Loaded || scene.type === Async.Type.Saveable) {
        return {
          ...state,
          [action.sceneId]: Async.mutate(scene, draft => {
            for (const nodeId in draft.nodes) {
              const { origin, startingOrigin } = draft.nodes[nodeId];
    
              if (!startingOrigin) continue;
    
              draft.nodes[nodeId].origin = {
                position: startingOrigin.position ? startingOrigin.position : undefined,
                orientation: startingOrigin.orientation ? startingOrigin.orientation : undefined,
                scale: startingOrigin.scale ? startingOrigin.scale : undefined,
              };
            }
          }),
        };
      }
      
      return state;
    }
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
    case 'scenes/set-node': return mutate(state, action.sceneId, scene => {
      scene.nodes[action.nodeId] = action.node;
    });
    case 'scenes/set-node-batch': return mutate(state, action.sceneId, scene => {
      for (const { id, node } of action.nodeIds) scene.nodes[id] = node;
    });
    case 'scenes/add-geometry': return mutate(state, action.sceneId, scene => {
      scene.geometry[action.geometryId] = action.geometry;
    });
    case 'scenes/remove-geometry': return mutate(state, action.sceneId, scene => {
      delete scene.geometry[action.geometryId];
    });
    case 'scenes/set-geometry': return mutate(state, action.sceneId, scene => {
      scene.geometry[action.geometryId] = action.geometry;
    });
    case 'scenes/set-geometry-batch': return mutate(state, action.sceneId, scene => {
      for (const { id, geometry } of action.geometryIds) scene.geometry[id] = geometry;
    });
    case 'scenes/select-node': return mutate(state, action.sceneId, scene => {
      scene.selectedNodeId = action.nodeId;
    });
    case 'scenes/add-object': return mutate(state, action.sceneId, scene => {
      scene.geometry[action.object.geometryId] = action.geometry;
      scene.nodes[action.nodeId] = action.object;
    });
    case 'scenes/set-camera': return mutate(state, action.sceneId, scene => {
      scene.camera = action.camera;
    });
    case 'scenes/set-gravity': return mutate(state, action.sceneId, scene => {
      scene.gravity = action.gravity;
    });
    case 'scenes/set-node-origin': return mutate(state, action.sceneId, scene => {
      scene.nodes[action.nodeId].origin = action.origin;
      if (action.updateStarting) {
        scene.nodes[action.nodeId].startingOrigin = action.origin;
      }
    });
    case 'scenes/list-user-scenes': {
      void listUserScenes();
      return state;
    }
    case 'scenes/unfail-scene': return {
      ...state,
      [action.sceneId]: Async.unfail(state[action.sceneId]),
    };
    case 'scenes/add-script': return mutate(state, action.sceneId, scene => {
      if (!scene.scripts) scene.scripts = {};
      scene.scripts[action.scriptId] = action.script;
    });
    case 'scenes/remove-script': return mutate(state, action.sceneId, scene => {
      delete scene.scripts[action.scriptId];
    });
    case 'scenes/set-script': return mutate(state, action.sceneId, scene => {
      scene.scripts[action.scriptId] = action.script;
    });
    default: return state;
  }
};