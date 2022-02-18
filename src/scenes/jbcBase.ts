import { Vector3 } from "../unit-math";
import { Angle, Distance, Mass } from "../util";
import Node from "../state/State/Scene/Node";
import Camera from "../state/State/Scene/Camera";
import Scene from "../state/State/Scene";

export function createBaseSceneSurfaceA(): Scene {
  return {
    name: 'Base Scene - Surface A',
    description: 'A base scene using Surface A. Intended to be augmented to create full JBC scenes',
    authorId: 'KIPR',
    geometry: {
      'can': {
        type: 'cylinder',
        height: Distance.centimeters(11.15),
        radius: Distance.centimeters(3),
      },
      'ream': {
        type: 'box',
        size: {
          x: Distance.centimeters(27.94),
          y: Distance.centimeters(5.08),
          z: Distance.centimeters(21.59),
        },
      },
      'jbc_mat_a': {
        type: 'file',
        uri: 'static/jbcMatA.glb'
      },
      'ground': {
        type: 'plane',
        size: {
          x: Distance.meters(3.54),
          y: Distance.meters(3.54),
        },
      },
    },
    nodes: {
      'jbc_mat_a': {
        type: 'object',
        geometryId: 'jbc_mat_a',
        name: 'JBC Surface A',
        origin: {
          position: {
            x: Distance.meters(0),
            y: Distance.meters(1.02),
            z: Distance.meters(0),
          },
          scale: {
            x: 100,
            y: 100,
            z: 100,
          }
        },
        visible: true,
        physics: {
          type: 'box',
          restitution: 0,
          friction: 1
        },
      },
      'ground': {
        type: 'object',
        geometryId: 'ground',
        name: 'Ground',
        origin: {
          position: {
            x: Distance.meters(0),
            y: Distance.meters(1.018),
            z: Distance.meters(0),
          },
          orientation: {
            type: 'euler',
            x: Angle.degrees(90),
            y: Angle.degrees(0),
            z: Angle.degrees(0),
          }
        },
        visible: true,
        physics: {
          type: 'box',
          restitution: 0,
          friction: 1,
        },
      },
      'light0': {
        type: 'point-light',
        intensity: 1,
        name: 'Light',
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
          x: Distance.centimeters(0),
          y: Distance.centimeters(111),
          z: Distance.centimeters(-50),
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
        x: Distance.meters(1),
        y: Distance.meters(2),
        z: Distance.meters(1),
      }
    }),
    gravity: {
      x: Distance.meters(0),
      y: Distance.meters(-9.8 / 2),
      z: Distance.meters(0),
    }
  };
}

export function createBaseSceneSurfaceB(): Scene {
  return {
    name: 'Base Scene - Surface B',
    description: 'A base scene using Surface B. Intended to be augmented to create full JBC scenes',
    authorId: 'KIPR',
    geometry: {
      'can': {
        type: 'cylinder',
        height: Distance.centimeters(11.15),
        radius: Distance.centimeters(3),
      },
      'ream': {
        type: 'box',
        size: {
          x: Distance.centimeters(27.94),
          y: Distance.centimeters(5.08),
          z: Distance.centimeters(21.59),
        },
      },
      'jbc_mat_b': {
        type: 'file',
        uri: 'static/jbcMatB.glb'
      },
      'ground': {
        type: 'plane',
        size: {
          x: Distance.meters(3.54),
          y: Distance.meters(3.54),
        },
      },
    },
    nodes: {
      'jbc_mat_b': {
        type: 'object',
        geometryId: 'jbc_mat_b',
        name: 'JBC Surface B',
        origin: {
          position: {
            x: Distance.meters(0),
            y: Distance.meters(1.02),
            z: Distance.meters(0),
          },
          scale: {
            x: 100,
            y: 100,
            z: 100,
          }
        },
        visible: true,
        physics: {
          type: 'box',
          restitution: 0,
          friction: 1
        },
      },
      'ground': {
        type: 'object',
        geometryId: 'ground',
        name: 'Ground',
        origin: {
          position: {
            x: Distance.meters(0),
            y: Distance.meters(1.018),
            z: Distance.meters(0),
          },
          orientation: {
            type: 'euler',
            x: Angle.degrees(90),
            y: Angle.degrees(0),
            z: Angle.degrees(0),
          }
        },
        visible: true,
        physics: {
          type: 'box',
          restitution: 0,
          friction: 1,
        },
      },
      'light0': {
        type: 'point-light',
        intensity: 10000,
        name: 'Light',
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
          x: Distance.centimeters(0),
          y: Distance.centimeters(111),
          z: Distance.centimeters(-50),
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
        x: Distance.meters(1),
        y: Distance.meters(2),
        z: Distance.meters(1),
      }
    }),
    gravity: {
      x: Distance.meters(0),
      y: Distance.meters(-9.8 / 2),
      z: Distance.meters(0),
    }
  };
}

/**
 * Helper function to create a Node for a can
 * @param canNumber The 1-index can number
 * @param canPosition The position of the can. If not provided, the position is determined using canNumber
 * @returns A can Node that can be inserted into a Scene
 */
export function createCanNode(canNumber: number, canPosition?: Vector3): Node {
  return {
    type: 'object',
    geometryId: 'can',
    name: `Can ${canNumber}`,
    origin: {
      position: canPosition ?? canPositions[canNumber - 1],
    },
    editable: false,
    visible: true,
    physics: {
      type: 'cylinder',
      mass: Mass.grams(5),
      friction: 0.7,
      restitution: 0.3,
    },
  };
}

/**
 * Positions of cans 1 - 12, based on the circles on JBC Surface A
 */
const canPositions: Vector3[] = [
  {
    x: Distance.centimeters(-22.7),
    y: Distance.centimeters(109),
    z: Distance.centimeters(-14.8),
  },
  {
    x: Distance.centimeters(0),
    y: Distance.centimeters(109),
    z: Distance.centimeters(-21.2),
  },
  {
    x: Distance.centimeters(16.2),
    y: Distance.centimeters(109),
    z: Distance.centimeters(-24.3),
  },
  {
    x: Distance.centimeters(0),
    y: Distance.centimeters(109),
    z: Distance.centimeters(-7.3),
  },
  {
    x: Distance.centimeters(-14.3),
    y: Distance.centimeters(109),
    z: Distance.centimeters(6.9),
  },
  {
    x: Distance.centimeters(0),
    y: Distance.centimeters(109),
    z: Distance.centimeters(7.2),
  },
  {
    x: Distance.centimeters(13.8),
    y: Distance.centimeters(109),
    z: Distance.centimeters(6.9),
  },
  {
    x: Distance.centimeters(26),
    y: Distance.centimeters(109),
    z: Distance.centimeters(15.5),
  },
  {
    x: Distance.centimeters(0),
    y: Distance.centimeters(109),
    z: Distance.centimeters(35.4),
  },
  {
    x: Distance.centimeters(-19.3),
    y: Distance.centimeters(109),
    z: Distance.centimeters(46.9),
  },
  {
    x: Distance.centimeters(0),
    y: Distance.centimeters(109),
    z: Distance.centimeters(56.6),
  },
  {
    x: Distance.centimeters(19.2),
    y: Distance.centimeters(109),
    z: Distance.centimeters(46.9),
  },
];