import Scene from "../State/Scene";
import Node from "../State/Scene/Node";
import Geometry from "../State/Scene/Geometry";
import { ReferenceFrame } from "../../unit-math";
import Camera from "../State/Scene/Camera";

import { JBC_1 } from '../../scenes';
import { ReferencedScenePair } from "..";

export namespace SceneAction {
  export interface ReplaceScene {
    type: 'replace-scene';
    scene: Scene;
  }

  export type ReplaceSceneParams = Omit<ReplaceScene, 'type'>;

  export const replaceScene = (params: ReplaceSceneParams): ReplaceScene => ({
    type: 'replace-scene',
    ...params
  });

  export interface ResetScene {
    type: 'reset-scene';
  }

  export const RESET_SCENE: ResetScene = { type: 'reset-scene' };

  export interface AddNode {
    type: 'add-node';
    id: string;
    node: Node;
  }

  export type AddNodeParams = Omit<AddNode, 'type'>;

  export const addNode = (params: AddNodeParams): AddNode => ({
    type: 'add-node',
    ...params
  });


  export interface RemoveNode {
    type: 'remove-node';
    id: string;
  }

  export type RemoveNodeParams = Omit<RemoveNode, 'type'>;

  export const removeNode = (params: RemoveNodeParams): RemoveNode => ({
    type: 'remove-node',
    ...params
  });

  export interface SetNode {
    type: 'set-node';
    id: string;
    node: Node;
    modifyReferenceScene: boolean;
    modifyOrigin: boolean;
  }

  export type SetNodeParams = Omit<SetNode, 'type'>;

  export const setNode = (params: SetNodeParams): SetNode => ({
    type: 'set-node',
    ...params
  });

  export interface SetNodeBatch {
    type: 'set-node-batch';
    nodeIds: {
      id: string;
      node: Node;
    }[];
    modifyReferenceScene: boolean;
  }

  export type SetNodeBatchParams = Omit<SetNodeBatch, 'type'>;

  export const setNodeBatch = (params: SetNodeBatchParams): SetNodeBatch => ({
    type: 'set-node-batch',
    ...params
  });

  export interface AddGeometry {
    type: 'add-geometry';
    id: string;
    geometry: Geometry;
  }

  export type AddGeometryParams = Omit<AddGeometry, 'type'>;

  export const addGeometry = (params: AddGeometryParams): AddGeometry => ({
    type: 'add-geometry',
    ...params
  });

  export interface RemoveGeometry {
    type: 'remove-geometry';
    id: string;
  }

  export type RemoveGeometryParams = Omit<RemoveGeometry, 'type'>;

  export const removeGeometry = (params: RemoveGeometryParams): RemoveGeometry => ({
    type: 'remove-geometry',
    ...params
  });

  export interface SetGeometry {
    type: 'set-geometry';
    id: string;
    geometry: Geometry;
  }

  export type SetGeometryParams = Omit<SetGeometry, 'type'>;
  
  export const setGeometry = (params: SetGeometryParams): SetGeometry => ({
    type: 'set-geometry',
    ...params
  });

  export interface SetGeometryBatch {
    type: 'set-geometry-batch';
    geometryIds: {
      id: string;
      geometry: Geometry;
    }[];
  }

  export type SetGeometryBatchParams = Omit<SetGeometryBatch, 'type'>;

  export const setGeometryBatch = (params: SetGeometryBatchParams): SetGeometryBatch => ({
    type: 'set-geometry-batch',
    ...params
  });

  export interface SelectNode {
    type: 'select-node';
    id?: string;
  }

  export type SelectNodeParams = Omit<SelectNode, 'type'>;

  export const selectNode = (params: SelectNodeParams): SelectNode => ({
    type: 'select-node',
    ...params
  });

  export interface UnselectAll {
    type: 'unselect-all';
  }

  export const UNSELECT_ALL: UnselectAll = { type: 'unselect-all' };

  export interface AddObject {
    type: 'add-object';
    id: string;
    object: Node.Obj;
    geometry: Geometry;
  }

  export type AddObjectParams = Omit<AddObject, 'type'>;

  export const addObject = (params: AddObjectParams): AddObject => ({
    type: 'add-object',
    ...params
  });

  export interface SetRobotOrigin {
    type: 'set-robot-origin';
    origin: ReferenceFrame;
    modifyReferenceScene: boolean;
  }

  export type SetRobotOriginParams = Omit<SetRobotOrigin, 'type'>;

  export const setRobotOrigin = (params: SetRobotOriginParams): SetRobotOrigin => ({
    type: 'set-robot-origin',
    ...params
  });

  export interface SetCamera {
    type: 'set-camera';
    camera: Camera;
  }

  export type SetCameraParams = Omit<SetCamera, 'type'>;

  export const setCamera = (params: SetCameraParams): SetCamera => ({
    type: 'set-camera',
    ...params
  });
}

export type SceneAction = (
  SceneAction.ReplaceScene |
  SceneAction.ResetScene |
  SceneAction.AddNode |
  SceneAction.RemoveNode |
  SceneAction.SetNode |
  SceneAction.SetNodeBatch |
  SceneAction.AddGeometry |
  SceneAction.RemoveGeometry |
  SceneAction.SetGeometry |
  SceneAction.SetGeometryBatch |
  SceneAction.SelectNode |
  SceneAction.UnselectAll |
  SceneAction.AddObject |
  SceneAction.SetRobotOrigin |
  SceneAction.SetCamera
);

export const reduceScene = (state: ReferencedScenePair = { referenceScene: JBC_1, workingScene: JBC_1 }, action: SceneAction): ReferencedScenePair => {
  switch (action.type) {
    case 'replace-scene':
      return {
        referenceScene: { ...action.scene },
        workingScene: { ...action.scene },
      };
    case 'reset-scene':
      return {
        ...state,
        workingScene: state.referenceScene,
      };
    case 'add-node':
      return {
        referenceScene: {
          ...state.referenceScene,
          nodes: {
            ...state.referenceScene.nodes,
            [action.id]: action.node,
          },
        },
        workingScene: {
          ...state.workingScene,
          nodes: {
            ...state.workingScene.nodes,
            [action.id]: action.node,
          },
        },
      };
    case 'remove-node': {
      const nextState: ReferencedScenePair = {
        referenceScene: {
          ...state.referenceScene,
          nodes: {
            ...state.referenceScene.nodes,
          },
        },
        workingScene: {
          ...state.workingScene,
          nodes: {
            ...state.workingScene.nodes,
          },
        },
      };

      delete nextState.referenceScene.nodes[action.id];
      delete nextState.workingScene.nodes[action.id];

      return nextState;
    }
    case 'set-node': {
      const nextState: ReferencedScenePair = {
        ...state,
        workingScene: {
          ...state.workingScene,
          nodes: {
            ...state.workingScene.nodes,
            [action.id]: action.modifyOrigin ? action.node : { ...action.node, origin: state.workingScene.nodes[action.id].origin },
          },
        },
      };

      if (action.modifyReferenceScene) {
        nextState.referenceScene = {
          ...state.referenceScene,
          nodes: {
            ...state.referenceScene.nodes,
            [action.id]: action.modifyOrigin ? action.node : { ...action.node, origin: state.referenceScene.nodes[action.id].origin },
          },
        };
      }

      return nextState;
    }
    case 'set-node-batch': {
      const nextState: ReferencedScenePair = {
        ...state,
        workingScene: {
          ...state.workingScene,
          nodes: {
            ...state.workingScene.nodes,
          },
        },
      };

      for (const { id, node } of action.nodeIds) {
        nextState.workingScene.nodes[id] = node;
      }

      if (action.modifyReferenceScene) {
        nextState.referenceScene = {
          ...state.referenceScene,
          nodes: {
            ...state.referenceScene.nodes,
          },
        };

        for (const { id, node } of action.nodeIds) {
          nextState.referenceScene.nodes[id] = node;
        }
      }

      return nextState;
    }
    case 'add-geometry':
      return {
        referenceScene: {
          ...state.referenceScene,
          geometry: {
            ...state.referenceScene.geometry,
            [action.id]: action.geometry,
          },
        },
        workingScene: {
          ...state.workingScene,
          geometry: {
            ...state.workingScene.geometry,
            [action.id]: action.geometry,
          },
        },
      };
    case 'remove-geometry': {
      const nextState: ReferencedScenePair = {
        referenceScene: {
          ...state.referenceScene,
          geometry: {
            ...state.referenceScene.geometry,
          },
        },
        workingScene: {
          ...state.workingScene,
          geometry: {
            ...state.workingScene.geometry,
          },
        },
      };

      delete nextState.referenceScene.geometry[action.id];
      delete nextState.workingScene.geometry[action.id];

      return nextState;
    }
    case 'set-geometry':
      return {
        referenceScene: {
          ...state.referenceScene,
          geometry: {
            ...state.referenceScene.geometry,
            [action.id]: action.geometry,
          },
        },
        workingScene: {
          ...state.workingScene,
          geometry: {
            ...state.workingScene.geometry,
            [action.id]: action.geometry,
          },
        },
      };
    case 'set-geometry-batch': {
      const nextState: ReferencedScenePair = {
        referenceScene: {
          ...state.referenceScene,
          geometry: {
            ...state.referenceScene.geometry,
          },
        },
        workingScene: {
          ...state.workingScene,
          geometry: {
            ...state.workingScene.geometry,
          },
        },
      };

      for (const { id, geometry } of action.geometryIds) {
        nextState.referenceScene.geometry[id] = geometry;
        nextState.workingScene.geometry[id] = geometry;
      }

      return nextState;
    }
    case 'select-node':
      return {
        ...state,
        workingScene: {
          ...state.workingScene,
          selectedNodeId: action.id,
        },
      };
    case 'unselect-all':
      return {
        ...state,
        workingScene: {
          ...state.workingScene,
          selectedNodeId: undefined,
        },
      };
    case 'add-object':
      return {
        referenceScene: {
          ...state.referenceScene,
          nodes: {
            ...state.referenceScene.nodes,
            [action.id]: action.object,
          },
          geometry: {
            ...state.referenceScene.geometry,
            [action.object.geometryId]: action.geometry,
          },
        },
        workingScene: {
          ...state.workingScene,
          nodes: {
            ...state.workingScene.nodes,
            [action.id]: action.object,
          },
          geometry: {
            ...state.workingScene.geometry,
            [action.object.geometryId]: action.geometry,
          },
        },
      };
    case 'set-robot-origin': {
      const nextState: ReferencedScenePair = {
        ...state,
        workingScene: {
          ...state.workingScene,
          robot: {
            ...state.workingScene.robot,
            origin: action.origin,
          },
        },
      };

      if (action.modifyReferenceScene) {
        nextState.referenceScene = {
          ...state.referenceScene,
          robot: {
            ...state.referenceScene.robot,
            origin: action.origin,
          },
        };
      }

      return nextState;
    }
    case 'set-camera': 
      return {
        referenceScene: {
          ...state.referenceScene,
          camera: action.camera,
        },
        workingScene: {
          ...state.workingScene,
          camera: action.camera,
        },
      };
    default:
      return state;
  }
};