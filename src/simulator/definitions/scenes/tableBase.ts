import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from "../../../util/math/unitMath";
import { Distance } from "../../../util";
import Node from "../../../state/State/Scene/Node";
import Camera from "../../../state/State/Scene/Camera";
import Scene from "../../../state/State/Scene";
import AbstractRobot from '../../../programming/AbstractRobot';
import Author from '../../../db/Author';
import { Color } from "../../../state/State/Scene/Color";

import tr from '@i18n';
import { PhysicsMotionType } from "@babylonjs/core";

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(100, 4, 100),
  orientation: RotationwUnits.eulerDegrees(0, -90, 0),
};

const FRY_FLOOR_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(113, 17, -87),
  orientation: RotationwUnits.eulerDegrees(90, 0, 0),
};

const INNER_FRYER_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(113, 27, -87),
};

const GAME_TABLE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(0, 0, 0),
  scale: { x: 100, y: 100, z: 100 },
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

const GAME_TABLE_2025: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('2025 Game Table'),
  templateId: 'game_table_2025',
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
      'fry_floor': {
        type: 'box',
        size: {
          x: Distance.inches(2.8),
          y: Distance.inches(2.8),
          z: Distance.inches(0.1),
        },
      },
      'fryer_detection_box': {
        type: 'box',
        size: {
          x: Distance.inches(3),
          y: Distance.inches(3),
          z: Distance.inches(3),
        }
      }
    },
    nodes: {
      'robot': ROBOT,
      'game_table_2025': GAME_TABLE_2025,
      'fry_floor': {
        type: 'object',
        geometryId: 'fry_floor',
        name: tr('Fry floor'),
        startingOrigin: FRY_FLOOR_ORIGIN,
        origin: FRY_FLOOR_ORIGIN,
        physics: {
          type: "box",
          motionType: PhysicsMotionType.STATIC,
          restitution: .1,
          friction: .5,
        },
        editable: true,
        visible: true,
      },
      'potato_detector': {
        type: 'object',
        geometryId: 'fryer_detection_box',
        name: tr('Potato detector box'),
        startingOrigin: INNER_FRYER_ORIGIN,
        origin: INNER_FRYER_ORIGIN,
        visible: false,
        material: {
          type: 'basic',
          color: {
            type: 'color3',
            color: Color.rgb(0, 255, 0),
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

