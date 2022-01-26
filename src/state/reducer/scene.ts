import Scene from "../State/Scene";
import Node from "../State/Scene/Node";
import Geometry from "../State/Scene/Geometry";
import { Distance } from "../../util";
import { ReferenceFrame, Vector3 } from "../../unit-math";
import Camera from "../State/Scene/Camera";


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

export const TEST_SCENE: Scene = {
  name: 'test',
  description: 'A Test',
  authorId: 'Braden',
  geometry: {
    'box': {
      type: 'box',
      size: {
        x: Distance.centimeters(5),
        y: Distance.centimeters(5),
        z: Distance.centimeters(5),
      }
    },
    'table': {
      type: 'file',
      uri: 'static/arena.glb'
    },
    'jbc_mat': {
      type: 'file',
      uri: 'static/jbcMatA.glb'
    },
  },
  nodes: {
    'table': {
      type: 'object',
      geometryId: 'table',
      name: 'A Table',
      origin: {
        scale: {
          x: 30,
          y: 30,
          z: 30,
        }
      },
      physics: {
        type: 'mesh',
        restitution: 0,
        friction: 1
      },
      visible: true,
    },
    'jbc_mat': {
      type: 'object',
      geometryId: 'jbc_mat',
      name: 'JBC Material',
      origin: {
        position: {
          x: Distance.meters(0),
          y: Distance.meters(1.02),
          z: Distance.meters(0),
        },
        scale: {
          x: 70,
          y: 70,
          z: 70,
        }
      },
      visible: true,
      physics: {
        type: 'box',
        restitution: 0,
        friction: 1
      },
    },
    'light0': {
      type: 'point-light',
      intensity: 10000,
      name: 'light0',
      origin: {
        position: {
          x: Distance.meters(0),
          y: Distance.meters(2.00),
          z: Distance.meters(0),
        },
      },
      visible: true
    },
  },
  robot: {
    origin: {
      position: {
        x: Distance.meters(0),
        y: Distance.meters(1.2),
        z: Distance.meters(0),
      },
    }
  },
  camera: Camera.arcRotate({
    radius: Distance.meters(5),
    target: {
      x: Distance.meters(0),
      y: Distance.meters(1.1),
      z: Distance.meters(0),
    },
    position: {
      x: Distance.meters(2),
      y: Distance.meters(2),
      z: Distance.meters(2),
    }
  }),
  gravity: {
    x: Distance.meters(0),
    y: Distance.meters(-9.8 / 2),
    z: Distance.meters(0),
  }
};

export const reduceScene = (state: Scene = TEST_SCENE, action: SceneAction) => {
  console.log({ action });
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
    case 'add-object':
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.id]: action.object,
        },
        geometry: {
          ...state.geometry,
          [action.object.geometryId]: action.geometry,
        },
      };
    case 'set-robot-origin': return {
      ...state,
      robot: {
        ...state.robot,
        origin: action.origin,
      }
    };
    case 'set-camera': return {
      ...state,
      camera: action.camera,
    };
    default:
      return state;
  }
};