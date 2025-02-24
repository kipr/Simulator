import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from "../../../util/math/unitMath";
// import { Angle, Distance, Mass } from "../../../util";
import { Distance } from "../../../util";
// import { Distance } from "../../../util";
import Node from "../../../state/State/Scene/Node";
import Camera from "../../../state/State/Scene/Camera";
import Scene from "../../../state/State/Scene";
import AbstractRobot from '../../../programming/AbstractRobot';
// import LocalizedString from '../../../util/LocalizedString';
import Author from '../../../db/Author';
import { Color } from "../../../state/State/Scene/Color";
// import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

import tr from '@i18n';
// import { distance } from "colorjs.io/fn";
// import { scale } from "pdf-lib";
// import { sprintf } from 'sprintf-js';
// import Dict from '../../../util/objectOps/Dict';


const ROBOT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(100, 4, 100),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0),
};

/*
const GROUND_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(0, -.5, 0),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  scale: { x: 100, y: 100, z: 100 },
};
*/

const GROUND_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(0, -1, 0),
  orientation: RotationwUnits.eulerDegrees(90, 0, 0),
};

const FRY_FLOOR_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(113, 17, -87),
  orientation: RotationwUnits.eulerDegrees(90, 0, 0),
};

const GAME_TABLE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(0, 0, 0),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0),
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

const GAME_TABLE_2025: Node.Robot = {
  type: 'robot',
  name: tr('2025 Game Table'),
  robotId: 'game_table_2025',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  editable: false,
  startingOrigin: GAME_TABLE_ORIGIN,
  origin: GAME_TABLE_ORIGIN
};

export function createBaseSceneSurface(): Scene {
  return {
    name: tr('Base Scene - 2025 Botball Game Table'),
    description: tr('A base scene. Intended to be augmented to create the full game table'),
    author: Author.organization('kipr'),
    geometry: {
      'game_table_2025': {
        type: 'file',
        uri: '/static/object_binaries/2025_game_table.glb'
      },
      'ground': {
        type: 'box',
        size: {
          x: Distance.feet(8),
          y: Distance.feet(8),
          z: Distance.meters(0.01),
        },
      },
      'fry_floor': {
        type: 'box',
        size: {
          x: Distance.inches(2.8),
          y: Distance.inches(2.8),
          z: Distance.inches(0.1),
        },
      },
    },
    nodes: {
      'robot': ROBOT,
      'game_table_2025': GAME_TABLE_2025,
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
        material: {
          type: 'basic',
          color: {
            type: 'color3',
            color: Color.rgb(192, 192, 192),
          },
        },
      },
      /*
      '2025 Game Table': {
        type: 'object',
        geometryId: 'game_table_2025',
        name: tr('2025 Botball game table'),
        startingOrigin: GROUND_ORIGIN,
        origin: GROUND_ORIGIN,
        visible: true,
        physics: {
          type: 'mesh',
          restitution: .1,
          friction: 1,
        },
      },
      */
      'fry_floor': {
        type: 'object',
        geometryId: 'fry_floor',
        name: tr('Fry floor'),
        startingOrigin: FRY_FLOOR_ORIGIN,
        origin: FRY_FLOOR_ORIGIN,
        physics: {
          type: "box",
          restitution: .1,
          friction: .5,
        },
        editable: true,
        visible: true,
      },
      'light0': {
        type: 'point-light',
        intensity: .25,
        name: tr('Light'),
        startingOrigin: LIGHT_ORIGIN,
        origin: LIGHT_ORIGIN,
        visible: true
      },
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
      y: Distance.meters(-9.8),
      z: Distance.meters(0),
    }
  };
}

