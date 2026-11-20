import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Node from '../../../state/State/Scene/Node';
import Camera from '../../../state/State/Scene/Camera';
import Scene from '../../../state/State/Scene';
import AbstractRobot from '../../../programming/AbstractRobot';
import Author from '../../../db/Author';
import {
  FALL_27_TABLE_CENTER,
  FALL_27_TABLE_GEOMETRY,
  FALL_27_TABLE_NODES,
  fall27TablePoint,
} from './2027FallGameTable';

import tr from '@i18n';

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(0, 0, 0),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0),
};

const LIGHT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(FALL_27_TABLE_CENTER.x, FALL_27_TABLE_CENTER.y + 120, FALL_27_TABLE_CENTER.z),
};

// Looking across the table from its x = -121.92 edge (table coordinates).
const CAMERA_POSITION = fall27TablePoint([-231.92, 152, 0]);

const ROBOT: Node.Robot = {
  type: 'robot',
  name: tr('Robot'),
  robotId: 'demobot',
  state: AbstractRobot.Stateless.NIL,
  editable: true,
  visible: true,
  startingOrigin: ROBOT_ORIGIN,
  origin: ROBOT_ORIGIN,
};

export function createBaseSceneSurface(): Scene {
  return {
    name: tr('Base Scene - 2026-2027 Botball Fall Game Table'),
    description: tr('A base scene. Intended to be augmented to create the full game table'),
    author: Author.organization('kipr'),
    geometry: { ...FALL_27_TABLE_GEOMETRY },
    nodes: {
      'robot': ROBOT,
      ...FALL_27_TABLE_NODES,
      'light0': {
        type: 'point-light',
        intensity: 0.8,
        name: tr('Light'),
        startingOrigin: LIGHT_ORIGIN,
        origin: LIGHT_ORIGIN,
        visible: true,
      },
    },
    camera: Camera.arcRotate({
      radius: Distance.meters(5),
      target: {
        x: Distance.centimeters(FALL_27_TABLE_CENTER.x),
        y: Distance.centimeters(FALL_27_TABLE_CENTER.y),
        z: Distance.centimeters(FALL_27_TABLE_CENTER.z),
      },
      position: {
        x: Distance.centimeters(CAMERA_POSITION.x),
        y: Distance.centimeters(CAMERA_POSITION.y),
        z: Distance.centimeters(CAMERA_POSITION.z),
      },
    }),
    gravity: {
      x: Distance.meters(0),
      y: Distance.meters(-9.8),
      z: Distance.meters(0),
    },
  };
}
