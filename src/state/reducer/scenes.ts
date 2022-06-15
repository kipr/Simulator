import Scene from "../State/Scene";
import { Scenes } from "../State";
import Async from "../State/Async";
import * as JBC_SCENES from '../../scenes';

export namespace ScenesAction {
  export interface AddScene {
    type: 'add-scene';
    id: string;
    scene: Scene;
  }

  export type AddSceneParams = Omit<AddScene, 'type'>;

  export const addScene = (params: AddSceneParams): AddScene => ({
    type: 'add-scene',
    ...params
  });

  export interface RemoveScene {
    type: 'remove-scene';
    id: string;
  }

  export type RemoveSceneParams = Omit<RemoveScene, 'type'>;

  export const removeScene = (params: RemoveSceneParams): RemoveScene => ({
    type: 'remove-scene',
    ...params
  });

  export interface SetScene {
    type: 'set-scene';
    id: string;
    scene: Scene;
  }

  export type SetSceneParams = Omit<SetScene, 'type'>;

  export const setScene = (params: SetSceneParams): SetScene => ({
    type: 'set-scene',
    ...params
  });

  export interface SetSceneBatch {
    type: 'set-scene-batch';
    sceneIds: {
      id: string;
      scene: Scene;
    }[];
  }

  export type SetSceneBatchParams = Omit<SetSceneBatch, 'type'>;

  export const setSceneBatch = (params: SetSceneBatchParams): SetSceneBatch => ({
    type: 'set-scene-batch',
    ...params
  });

  export interface LoadScene {
    type: 'load-scene';
    id: string;
    uri: string;
  }

  export type LoadSceneParams = Omit<LoadScene, 'type'>;

  export const loadScene = (params: LoadSceneParams): LoadScene => ({
    type: 'load-scene',
    ...params
  });
}

export type ScenesAction = (
  ScenesAction.AddScene |
  ScenesAction.RemoveScene |
  ScenesAction.SetScene |
  ScenesAction.SetSceneBatch |
  ScenesAction.LoadScene
);

const DEFAULT_SCENES: Scenes = {
  scenes: {
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
  },
  activeId: 'jbcSandboxA',
};

export const reduceScenes = (state: Scenes = DEFAULT_SCENES, action: ScenesAction): Scenes => {
  switch (action.type) {
    case 'add-scene':
      return {
        ...state,
        scenes: {
          ...state.scenes,
          [action.id]: Async.loaded({ value: action.scene })
        }
      };
    case 'remove-scene': {
      const nextState: Scenes = {
        ...state,
        scenes: {
          ...state.scenes,
        },
      };

      delete nextState.scenes[action.id];

      return nextState;
    }
    case 'set-scene':
      return {
        ...state,
        scenes: {
          ...state.scenes,
          [action.id]: Async.loaded({ value: action.scene }),
        },
      };
    case 'set-scene-batch': {
      const nextState: Scenes = {
        ...state,
        scenes: {
          ...state.scenes,
        },
      };

      for (const { id, scene } of action.sceneIds) {
        nextState.scenes[id] = Async.loaded({ value: scene });
      }

      return nextState;
    }
    case 'load-scene':
      return {
        ...state,
        scenes: {
          ...state.scenes,
          [action.id]: Async.loading({ uri: action.uri }),
        },
      };
    default:
      return state;
  }
};