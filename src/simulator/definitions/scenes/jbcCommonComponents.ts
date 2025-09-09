import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Node from '../../../state/State/Scene/Node';
import Geometry from "../../../state/State/Scene/Geometry";
import Camera from '../../../state/State/Scene/Camera';
import Scene from '../../../state/State/Scene';
import { Color } from '../../../state/State/Scene/Color';
import AbstractRobot from '../../../programming/AbstractRobot';
import Author from '../../../db/Author';
import { PhysicsMotionType } from '@babylonjs/core';

import tr from '@i18n';
import { sprintf } from 'sprintf-js';
import Dict from '../../../util/objectOps/Dict';

/**
 * @constant This is the canonical node visibility function.
 */
export const setNodeVisible = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});
`;

/**
 * @constant This is the canonical Y angle calculation function. It calculates
 * the angle of a node relative to horizontal where 0 is horizontal, 90 is
 * upright, and -90 is upside-down.
 */
const getNodeYAngle = `
// Upright Condition
const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));
`;

/**
 * @constant The canonical function to check if a node is upright.
 */
export const nodeUpright = `
${getNodeYAngle}
const nodeUpright = (nodeId) => yAngle(nodeId) > 5;
`;

/**
 * @constant The canonical notInStartBox function
 */
export const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot not started in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

export const matAStartGeoms: Dict<Geometry> = {
  startBoxGeom: {
    type: 'box',
    size: {
      x: Distance.feet(2),
      y: Distance.centimeters(0.1),
      z: Distance.feet(1),
    },
  },
  notStartBoxGeom: {
    type: 'box',
    size: {
      x: Distance.meters(3.54),
      y: Distance.centimeters(10),
      z: Distance.meters(2.13),
    },
  },
};

export const matAStartNodes: Dict<Node> = {
  startBox: {
    type: 'object',
    geometryId: 'startBoxGeom',
    name: tr('Start Box'),
    visible: false,
    origin: {
      position: {
        x: Distance.centimeters(0),
        y: Distance.centimeters(-6.9),
        z: Distance.centimeters(0),
      },
    },
    material: {
      type: 'pbr',
      emissive: {
        type: 'color3',
        color: Color.rgb(255, 255, 255),
      },
    },
  },
  notStartBox: {
    type: 'object',
    geometryId: 'notStartBoxGeom',
    name: tr('Not Start Box'),
    visible: false,
    origin: {
      position: {
        x: Distance.centimeters(0),
        y: Distance.centimeters(-1.9),
        z: Distance.meters(1.208),
      },
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(255, 0, 0),
      },
    },
  },
};

export const garageGeoms: Dict<Geometry> = {
  greenGarage_geom: {
    type: 'box',
    size: {
      x: Distance.centimeters(18),
      y: Distance.centimeters(0.1),
      z: Distance.centimeters(18),
    },
  },
  blueGarage_geom: {
    type: 'box',
    size: {
      x: Distance.centimeters(18),
      y: Distance.centimeters(0.1),
      z: Distance.centimeters(18),
    },
  },
  yellowGarage_geom: {
    type: 'box',
    size: {
      x: Distance.centimeters(16),
      y: Distance.centimeters(0.1),
      z: Distance.centimeters(18),
    },
  },
};

const BLUE_GARAGE_ORIGIN = {
  position: {
    x: Distance.centimeters(-12.5),
    y: Distance.centimeters(-6.9),
    z: Distance.centimeters(94.5),
  },
  orientation: RotationwUnits.eulerDegrees(0, 45, 0),
};

export const garageNodes: Dict<Node> = {
  greenGarage: {
    type: 'object',
    geometryId: 'greenGarage_geom',
    name: tr('Green Garage'),
    visible: false,
    origin: {
      position: {
        x: Distance.centimeters(0),
        y: Distance.centimeters(-6.9),
        z: Distance.centimeters(53),
      },
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(0, 255, 0),
      },
    },
  },
  blueGarage: {
    type: 'object',
    geometryId: 'blueGarage_geom',
    name: tr('Blue Garage'),
    visible: false,
    origin: BLUE_GARAGE_ORIGIN,
    startingOrigin: BLUE_GARAGE_ORIGIN,
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(0, 0, 255),
      },
    },
  },
  yellowGarage: {
    type: 'object',
    geometryId: 'yellowGarage_geom',
    name: tr('Yellow Garage'),
    visible: false,
    origin: {
      position: {
        x: Distance.centimeters(18.8),
        y: Distance.centimeters(-6.9),
        z: Distance.centimeters(78),
      },
    },
    material: {
      type: 'basic',
      color: {
        type: 'color3',
        color: Color.rgb(255, 0, 0),
      },
    },
  },
};
