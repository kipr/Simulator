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
        type: 'from-template',
        templateId: 'jbc_mat_a',
        name: 'JBC Surface A',
        origin: {
          position: {
            x: Distance.centimeters(0),
            y: Distance.centimeters(-7),
            z: Distance.centimeters(50),
          },
          scale: {
            x: 100,
            y: 100,
            z: 100,
          }
        },
        visible: true,
      },
      'ground': {
        type: 'object',
        geometryId: 'ground',
        name: 'Ground',
        origin: {
          position: {
            x: Distance.centimeters(0),
            y: Distance.centimeters(-7.2),
            z: Distance.centimeters(50),
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
            y: Distance.meters(0.91),
            z: Distance.meters(0.5),
          },
        },
        visible: true
      },
    },
    robot: {
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(2),
          z: Distance.centimeters(0),
        },
      }
    },
    camera: Camera.arcRotate({
      radius: Distance.meters(5),
      target: {
        x: Distance.meters(0),
        y: Distance.meters(0),
        z: Distance.meters(0.5),
      },
      position: {
        x: Distance.meters(1),
        y: Distance.meters(0.91),
        z: Distance.meters(1.5),
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
        type: 'from-template',
        templateId: 'jbc_mat_b',
        name: 'JBC Surface B',
        origin: {
          position: {
            x: Distance.centimeters(0),
            y: Distance.centimeters(-7),
            z: Distance.centimeters(50),
          },
          scale: {
            x: 100,
            y: 100,
            z: 100,
          }
        },
        visible: true,
      },
      'ground': {
        type: 'object',
        geometryId: 'ground',
        name: 'Ground',
        origin: {
          position: {
            x: Distance.centimeters(0),
            y: Distance.centimeters(-7.2),
            z: Distance.centimeters(50),
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
            y: Distance.meters(0.91),
            z: Distance.meters(0.5),
          },
        },
        visible: true
      },
    },
    robot: {
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(2),
          z: Distance.centimeters(0),
        },
      }
    },
    camera: Camera.arcRotate({
      radius: Distance.meters(5),
      target: {
        x: Distance.meters(0),
        y: Distance.meters(0),
        z: Distance.meters(0.5),
      },
      position: {
        x: Distance.meters(1),
        y: Distance.meters(0.91),
        z: Distance.meters(1.5),
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
 * @param editable Whether the can is editable
 * @param visible Whether the can is visible
 * @returns A can Node that can be inserted into a Scene
 */
export function createCanNode(canNumber: number, canPosition?: Vector3, editable?: boolean, visible?: boolean): Node {
  return {
    type: 'from-template',
    templateId: 'can',
    name: `Can ${canNumber}`,
    origin: {
      position: canPosition ?? canPositions[canNumber - 1],
    },
    editable: editable ?? false,
    visible: visible ?? true,
  };
}

/**
 * Positions of cans 1 - 12, based on the circles on JBC Surface A
 */
const canPositions: Vector3[] = [
  {
    x: Distance.centimeters(-22.7),
    y: Distance.centimeters(0),
    z: Distance.centimeters(35.2),
  },
  {
    x: Distance.centimeters(0),
    y: Distance.centimeters(0),
    z: Distance.centimeters(28.8),
  },
  {
    x: Distance.centimeters(16.2),
    y: Distance.centimeters(0),
    z: Distance.centimeters(25.7),
  },
  {
    x: Distance.centimeters(0),
    y: Distance.centimeters(0),
    z: Distance.centimeters(42.7),
  },
  {
    x: Distance.centimeters(-14.3),
    y: Distance.centimeters(0),
    z: Distance.centimeters(56.9),
  },
  {
    x: Distance.centimeters(0),
    y: Distance.centimeters(0),
    z: Distance.centimeters(57.2),
  },
  {
    x: Distance.centimeters(13.8),
    y: Distance.centimeters(0),
    z: Distance.centimeters(56.9),
  },
  {
    x: Distance.centimeters(26),
    y: Distance.centimeters(0),
    z: Distance.centimeters(65.5),
  },
  {
    x: Distance.centimeters(0),
    y: Distance.centimeters(0),
    z: Distance.centimeters(85.4),
  },
  {
    x: Distance.centimeters(-19.3),
    y: Distance.centimeters(0),
    z: Distance.centimeters(96.9),
  },
  {
    x: Distance.centimeters(0),
    y: Distance.centimeters(0),
    z: Distance.centimeters(106.6),
  },
  {
    x: Distance.centimeters(19.2),
    y: Distance.centimeters(0),
    z: Distance.centimeters(96.9),
  },
];