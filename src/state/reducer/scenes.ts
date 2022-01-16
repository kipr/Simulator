import Scene from "../State/Scene";
import Node from "../State/Scene/Node";
import Geometry from "../State/Scene/Geometry";
import { Scenes } from "../State";
import Async from "../State/Async";
import { TEST_SCENE } from './scene';


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
    test: Async.loaded({ value: TEST_SCENE })
  },
  activeId: 'test',
}

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