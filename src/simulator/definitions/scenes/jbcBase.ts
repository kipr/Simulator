import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from "../../../util/math/unitMath";
import { Angle, Distance, Mass } from "../../../util";
import Node from "../../../state/State/Scene/Node";
import Camera from "../../../state/State/Scene/Camera";
import Scene from "../../../state/State/Scene";
import AbstractRobot from '../../../programming/AbstractRobot';
import LocalizedString from '../../../util/LocalizedString';
import Author from '../../../db/Author';

import tr from '@i18n';
import { sprintf } from 'sprintf-js';
import Dict from '../../../util/objectOps/Dict';

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(0, 0, 0),
  orientation: RotationwUnits.eulerDegrees(0, -45, 0),
};

const ROBOT: Node.Robot = {
  type: 'robot',
  name: tr('Robot'),
  robotId: 'demobot',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  startingOrigin: ROBOT_ORIGIN,
  origin: ROBOT_ORIGIN
};


const JBC_MAT_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(-7),
    z: Distance.centimeters(50),
  },
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};

const GROUND_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(-7.512),
    z: Distance.centimeters(50),
  },
  orientation: {
    type: 'euler',
    x: Angle.degrees(90),
    y: Angle.degrees(0),
    z: Angle.degrees(0),
  }
};

const LIGHT_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.meters(0),
    y: Distance.meters(0.91),
    z: Distance.meters(0.5),
  },
};

export function createBaseSceneSurfaceA(): Scene {
  return {
    name: tr('Base Scene - Surface A'),
    description: tr('A base scene using Surface A. Intended to be augmented to create full JBC scenes'),
    author: Author.organization('kipr'),
    geometry: {
      'ground': {
        type: 'box',
        size: {
          x: Distance.meters(3.54),
          y: Distance.meters(3.54),
          z: Distance.meters(0.01),
        },
      },
      'mat': {
        type: 'box',
        size: {
          x: Distance.feet(2),
          y: Distance.centimeters(.1),
          z: Distance.feet(4),
        }
      },
    },
    nodes: {
      'robot': ROBOT,
      'matA': {
        type: 'from-jbc-template',
        templateId: 'matA',
        name: tr('JBC Mat A'),
        startingOrigin: JBC_MAT_ORIGIN,
        origin: JBC_MAT_ORIGIN,
        visible: true,
        editable: true,
      },
      'ground': {
        type: 'object',
        geometryId: 'ground',
        name: tr('Ground'),
        startingOrigin: GROUND_ORIGIN,
        origin: GROUND_ORIGIN,
        visible: true,
        physics: {
          type: 'box',
          restitution: .3,
          friction: 1,
        },
      },
      'light0': {
        type: 'point-light',
        intensity: 1,
        name: tr('Light'),
        startingOrigin: LIGHT_ORIGIN,
        origin: LIGHT_ORIGIN,
        visible: true
      }
    },
    camera: Camera.arcRotate({
      radius: Distance.meters(1),
      target: {
        x: Distance.meters(0),
        y: Distance.meters(0),
        z: Distance.meters(0.25),
      },
      position: {
        x: Distance.meters(0.5),
        y: Distance.meters(0.5),
        z: Distance.meters(-.5),
      }
    }),
    gravity: {
      x: Distance.meters(0),
      y: Distance.meters(-9.8 * 0.4),
      z: Distance.meters(0),
    }
  };
}

export function createBaseSceneSurfaceB(): Scene {
  

  return {
    name: tr('Base Scene - Surface B'),
    description: tr('A base scene using Surface B. Intended to be augmented to create full JBC scenes'),
    author: Author.organization('kipr'),
    geometry: {
      'ground': {
        type: 'box',
        size: {
          x: Distance.meters(3.54),
          y: Distance.meters(3.54),
          z: Distance.meters(0.01),
        },
      },
    },
    nodes: {
      'robot': ROBOT,
      'matB': {
        type: 'from-jbc-template',
        templateId: 'matB',
        name: tr('JBC Mat B'),
        startingOrigin: JBC_MAT_ORIGIN,
        origin: JBC_MAT_ORIGIN,
        visible: true,
        editable: true,
      },
      'ground': {
        type: 'object',
        geometryId: 'ground',
        name: tr('Ground'),
        startingOrigin: GROUND_ORIGIN,
        origin: GROUND_ORIGIN,
        visible: true,
        physics: {
          type: 'box',
          restitution: 0.1,
          friction: 10,
        },
      },
      'light0': {
        type: 'point-light',
        intensity: 10000,
        name: tr('Light'),
        startingOrigin: LIGHT_ORIGIN,
        origin: LIGHT_ORIGIN,
        visible: true
      },
    },
    camera: Camera.arcRotate({
      radius: Distance.meters(2),
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
      y: Distance.meters(-9.8 * .4),
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
export function createCanNode(canNumber: number, canPosition?: Vector3wUnits, editable?: boolean, visible?: boolean): Node {
  const origin: ReferenceFramewUnits = {
    position: canPosition ?? canPositions[canNumber - 1],
    orientation: RotationwUnits.eulerDegrees(180, 0, 0),
  };

  return {
    type: 'from-jbc-template',
    templateId: 'can',
    name: Dict.map(tr('Can %s'), (str: string) => sprintf(str, canNumber)),
    startingOrigin: origin,
    origin,
    editable: editable ?? false,
    visible: visible ?? true,
  };
}

/**
 * Positions of cans 1 - 12, based on the circles on JBC Surface A
 */
const canPositions: Vector3wUnits[] = [
  {
    x: Distance.centimeters(22.7), // can 1
    y: Distance.centimeters(0),
    z: Distance.centimeters(35.2),
  },
  {
    x: Distance.centimeters(0), // can 2
    y: Distance.centimeters(0),
    z: Distance.centimeters(28.8),
  },
  {
    x: Distance.centimeters(-16.2), // can 3
    y: Distance.centimeters(0),
    z: Distance.centimeters(25.7),
  },
  {
    x: Distance.centimeters(0), // can 4
    y: Distance.centimeters(0),
    z: Distance.centimeters(42.7),
  },
  {
    x: Distance.centimeters(14.3), // can 5
    y: Distance.centimeters(0),
    z: Distance.centimeters(56.9),
  },
  {
    x: Distance.centimeters(0), // can 6
    y: Distance.centimeters(0),
    z: Distance.centimeters(57.2),
  },
  {
    x: Distance.centimeters(-13.8), // can 7
    y: Distance.centimeters(0),
    z: Distance.centimeters(56.9),
  },
  {
    x: Distance.centimeters(-26), // can 8 
    y: Distance.centimeters(0),
    z: Distance.centimeters(65.5),
  },
  {
    x: Distance.centimeters(0), // can 9
    y: Distance.centimeters(0),
    z: Distance.centimeters(85.4),
  },
  {
    x: Distance.centimeters(19.3),// can 10
    y: Distance.centimeters(0),
    z: Distance.centimeters(96.9),
  },
  {
    x: Distance.centimeters(0), // can 11
    y: Distance.centimeters(0),
    z: Distance.centimeters(106.6),
  },
  {
    x: Distance.centimeters(-19.2), // can 12
    y: Distance.centimeters(0),
    z: Distance.centimeters(96.9),
  },
];