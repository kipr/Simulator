import Scene from "../State/Scene";
import Node from "../State/Scene/Node";
import Geometry from "../State/Scene/Geometry";


export namespace SceneAction {
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
}

export type SceneAction = (
  SceneAction.AddNode |
  SceneAction.RemoveNode |
  SceneAction.SetNode |
  SceneAction.SetNodeBatch |
  SceneAction.AddGeometry |
  SceneAction.RemoveGeometry |
  SceneAction.SetGeometry |
  SceneAction.SetGeometryBatch |
  SceneAction.SelectNode |
  SceneAction.UnselectAll
);

export const reduceScene = (state: Scene = Scene.EMPTY, action: SceneAction) => {
  switch (action.type) {
    case 'add-node':
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.id]: action.node
        }
      };
    case 'remove-node': {
      const nextState: Scene = {
        ...state,
        nodes: {
          ...state.nodes,
        },
      };

      delete nextState.nodes[action.id];
      return nextState;
    }
    case 'set-node':
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.id]: action.node,
        },
      };
    case 'set-node-batch': {
      const nextState: Scene = {
        ...state,
        nodes: {
          ...state.nodes,
        },
      };

      for (const { id, node } of action.nodeIds) {
        nextState.nodes[id] = node;
      }

      return nextState;
    }
    case 'add-geometry':
      return {
        ...state,
        geometry: {
          ...state.geometry,
          [action.id]: action.geometry
        }
      };
    case 'remove-geometry': {
      const nextState: Scene = {
        ...state,
        geometry: {
          ...state.geometry,
        },
      };

      delete nextState.geometry[action.id];

      return nextState;
    }
    case 'set-geometry':
      return {
        ...state,
        geometry: {
          ...state.geometry,
          [action.id]: action.geometry,
        },
      };
    case 'set-geometry-batch': {
      const nextState: Scene = {
        ...state,
        geometry: {
          ...state.geometry,
        },
      };

      for (const { id, geometry } of action.geometryIds) {
        nextState.geometry[id] = geometry;
      }

      return nextState;
    }
    case 'select-node':
      return {
        ...state,
        selectedNodeId: action.id,
      };
    case 'unselect-all':
      return {
        ...state,
        selectedNodeId: undefined,
      };
    default:
      return state;
  }
};