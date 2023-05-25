import { ReferenceFrame, Rotation, Vector3 } from "../unit-math";
import { Angle, Distance, Mass } from "../util";
import Node from "../state/State/Scene/Node";
import Camera from "../state/State/Scene/Camera";
import Scene from "../state/State/Scene";
import AbstractRobot from '../AbstractRobot';
import LocalizedString from '../util/LocalizedString';
import Author from '../db/Author';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

import tr from '@i18n';
import { sprintf } from 'sprintf-js';
import Dict from '../Dict';

const ROBOT_ORIGIN: ReferenceFrame = {
  position: Vector3.centimeters(0, 10, 0),
  orientation: Rotation.eulerDegrees(0, 0, 0),
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

const JBC_MAT_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(-7.1),
    z: Distance.centimeters(50),
  },
  scale: {
    x: 100,
    y: 100,
    z: 100,
  }
};

const GROUND_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(-7.2 - 10),
    z: Distance.centimeters(50),
  },
  orientation: {
    type: 'euler',
    x: Angle.degrees(90),
    y: Angle.degrees(0),
    z: Angle.degrees(0),
  }
};

const SKY_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(-7.2 - 10),
    z: Distance.centimeters(50),
  },
  orientation: {
    type: 'euler',
    x: Angle.degrees(90),
    y: Angle.degrees(0),
    z: Angle.degrees(0),
  }
};

const LIGHT_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.meters(0),
    y: Distance.meters(40.91),
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
          x: Distance.meters(20.438),
          y: Distance.meters(20.438),
          z: Distance.meters(.2),
        },
      },
      'sky': {
        type: 'box',
        size: {
          x: Distance.meters(60),
          y: Distance.meters(60),
          z: Distance.meters(60),
        }
      }
    },
    nodes: {
      'robot': ROBOT,
      'jbc_mat_a': {
        type: 'from-jbc-template',
        templateId: 'jbc_mat_a',
        name: tr('JBC Surface A'),
        startingOrigin: JBC_MAT_ORIGIN,
        origin: JBC_MAT_ORIGIN,
        visible: true,
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
          restitution: 1,
          friction: 1,
        },
        material: {
          type: 'basic',
          color: {
            type: "texture",
            uri: "/static/Moon-2d-Surface.png"
          },
        },
      },
      'light0': {
        type: 'point-light',
        intensity: .25,
        name: tr('Light'),
        startingOrigin: LIGHT_ORIGIN,
        origin: LIGHT_ORIGIN,
        visible: true
      },
      'night_sky': {
        type: 'object',
        name: tr('skybox'),
        geometryId: 'sky',
        visible: true,
        startingOrigin: SKY_ORIGIN,
        origin: SKY_ORIGIN,
        material: {
          type: 'basic',
          color: {
            type: "texture",
            uri: "/static/earthrise.png"
          },
        },
      }
    },
    camera: Camera.arcRotate({
      radius: Distance.meters(5),
      target: {
        x: Distance.meters(0),
        y: Distance.meters(0),
        z: Distance.meters(0.05),
      },
      position: {
        x: Distance.meters(-1),
        y: Distance.meters(0.51),
        z: Distance.meters(-1.5),
      }
    }),
    gravity: {
      x: Distance.meters(0),
      y: Distance.meters(-9.8 * .17),
      z: Distance.meters(0),
    }
  };
}

