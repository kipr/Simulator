import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from "../../../util/math/unitMath";
import { Angle, Distance, Mass } from "../../../util";
import Node from "../../../state/State/Scene/Node";
import Camera from "../../../state/State/Scene/Camera";
import Scene from "../../../state/State/Scene";
import AbstractRobot from '../../../programming/AbstractRobot';
import LocalizedString from '../../../util/LocalizedString';
import Author from '../../../db/Author';
import { Color } from "../../../state/State/Scene/Color";
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

import tr from '@i18n';
import { sprintf } from 'sprintf-js';
import Dict from '../../../util/objectOps/Dict';


const ROBOT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(0, 4, 0),
  orientation: RotationwUnits.eulerDegrees(0, -45, 0),
};

const GROUND_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(0, -.5, 50),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0)
};

const START_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(0, 0, 0),
  orientation: RotationwUnits.eulerDegrees(0, 90, 0)
};

const SKY_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(0, -17.2, 50),
  orientation: RotationwUnits.eulerDegrees(90, 0, 0)
};

const LIGHT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.meters(0, 40.91, .5),
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

export function createBaseSceneSurface(): Scene {
  return {
    name: tr('Base Scene - Moon Surface'),
    description: tr('A base scene. Intended to be augmented to create full Moon scenes'),
    author: Author.organization('kipr'),
    geometry: {
      'moon ground': {
        type: 'cylinder',
        radius: Distance.feet(25),
        height: Distance.centimeters(1),
      },
      'sky': {
        type: 'box',
        size: {
          x: Distance.meters(15),
          y: Distance.meters(15),
          z: Distance.meters(15),
        }
      },
      'start': {
        type: 'box',
        size: {
          x: Distance.feet(2),
          y: Distance.centimeters(.1),
          z: Distance.feet(2),
        }
      },

    },
    nodes: {
      'robot': ROBOT,
      'Moon ground': {
        type: 'object',
        geometryId: 'moon ground',
        name: tr('1.1.1 Ground'),
        startingOrigin: GROUND_ORIGIN,
        origin: GROUND_ORIGIN,
        visible: true,
        physics: {
          type: 'box',
          restitution: .3,
          friction: 1,
        },
        material: {
          type: 'basic',
          color: {
            type: "texture",
            uri: "/static/textures/Moon-2d-Surface.png"
          },
        },
      },      
      'start': {
        type: 'object',
        geometryId: 'start',
        name: tr('1.1.6-8 Start Area'),
        startingOrigin: START_ORIGIN,
        origin: START_ORIGIN,
        visible: true,
        editable: true,
        physics: {
          type: 'box',
          restitution: .3,
          friction: 1,
        },
        material: {
          type: 'basic',
          color: {
            type: "texture",
            uri: "/static/textures/start_texture_light.png"
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
        name: tr('1.1.2-4 Sky'),
        geometryId: 'sky',
        visible: true,
        startingOrigin: SKY_ORIGIN,
        origin: SKY_ORIGIN,
        material: {
          type: 'basic',
          color: {
            type: "texture",
            uri: "/static/textures/earthrise.png"
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
      y: Distance.meters(-9.8 * 0.5),
      z: Distance.meters(0),
    }
  };
}

