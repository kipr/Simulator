import Scene from "../State/Scene";
import Node from "../State/Scene/Node";
import Geometry from "../State/Scene/Geometry";
import { ReferenceFrame } from "../../unit-math";
import Camera from "../State/Scene/Camera";

import { JBC_Sandbox_A } from '../../scenes';
import { ReferencedScenePair } from "..";
import { RobotState } from '../../RobotState';
import construct from '../../util/construct';

export namespace SceneAction {
  export interface ReplaceScene {
    type: 'replace-scene';
    scene: Scene;
  }

  export const replaceScene = construct<ReplaceScene>('replace-scene');
  
  export interface ResetScene {
    type: 'reset-scene';
  }

  export const RESET_SCENE: ResetScene = { type: 'reset-scene' };

  export interface AddNode {
    type: 'add-node';
    id: string;
    node: Node;
  }

  export const addNode = construct<AddNode>('add-node');


  export interface RemoveNode {
    type: 'remove-node';
    id: string;
  }

  export const removeNode = construct<RemoveNode>('remove-node');

  export interface SetNode {
    type: 'set-node';
    id: string;
    node: Node;
    modifyReferenceScene: boolean;
    modifyOrigin: boolean;
  }


  export const setNode = construct<SetNode>('set-node');

  export interface SetNodeBatch {
    type: 'set-node-batch';
    nodeIds: {
      id: string;
      node: Node;
    }[];
    modifyReferenceScene: boolean;
  }

  export const setNodeBatch = construct<SetNodeBatch>('set-node-batch');

  export interface AddGeometry {
    type: 'add-geometry';
    id: string;
    geometry: Geometry;
  }

  export const addGeometry = construct<AddGeometry>('add-geometry');

  export interface RemoveGeometry {
    type: 'remove-geometry';
    id: string;
  }

  export const removeGeometry = construct<RemoveGeometry>('remove-geometry');

  export interface SetGeometry {
    type: 'set-geometry';
    id: string;
    geometry: Geometry;
  }
  
  export const setGeometry = construct<SetGeometry>('set-geometry');

  export interface SetGeometryBatch {
    type: 'set-geometry-batch';
    geometryIds: {
      id: string;
      geometry: Geometry;
    }[];
  }

  export const setGeometryBatch = construct<SetGeometryBatch>('set-geometry-batch');

  export interface SelectNode {
    type: 'select-node';
    id?: string;
  }

  export const selectNode = construct<SelectNode>('select-node');

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

  export const addObject = construct<AddObject>('add-object');

  export interface SetRobotState {
    type: 'set-robot-state';
    nodeId: string;
    state: RobotState;
  }

  export const setRobotState = construct<SetRobotState>('set-robot-state');

  export interface SetCamera {
    type: 'set-camera';
    camera: Camera;
  }

  export const setCamera = construct<SetCamera>('set-camera');
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
  SceneAction.SetRobotState |
  SceneAction.SetCamera
);

export const reduceScene = (state: ReferencedScenePair = { referenceScene: JBC_Sandbox_A, workingScene: JBC_Sandbox_A }, action: SceneAction): ReferencedScenePair => {
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

      // Unselect node if it's being removed
      if (action.id === nextState.workingScene.selectedNodeId) {
        nextState.workingScene.selectedNodeId = undefined;
      }

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

      // Unselect node if it's invisible
      if (action.id === nextState.workingScene.selectedNodeId && !action.node.visible) {
        nextState.workingScene.selectedNodeId = undefined;
      }

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

        // Unselect node if it's invisible
        if (id === nextState.workingScene.selectedNodeId && !node.visible) {
          nextState.workingScene.selectedNodeId = undefined;
        }
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
    case 'select-node': {
      // Only existent, visible nodes can be selected
      const nodeToSelect = state.workingScene.nodes[action.id];
      if (!nodeToSelect || !nodeToSelect.visible) return state;

      return {
        ...state,
        workingScene: {
          ...state.workingScene,
          selectedNodeId: action.id,
        },
      };
    }
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
    case 'set-robot-state': {
      const node = state.workingScene.nodes[action.nodeId];
      if (!node) return state;
      if (node.type !== 'robot') return state;
      const nextState: ReferencedScenePair = {
        ...state,
        workingScene: {
          ...state.workingScene,
          nodes: {
            ...state.workingScene.nodes,
            [action.nodeId]: {
              ...node,
              state: action.state,
            },
          }
        },
      };
      return nextState;
    }
    default:
      return state;
  }
};