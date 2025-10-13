import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Node from '../../../state/State/Scene/Node';
import Camera from '../../../state/State/Scene/Camera';
import Scene from '../../../state/State/Scene';
import AbstractRobot from '../../../programming/AbstractRobot';
import Author from '../../../db/Author';
import { Color } from '../../../state/State/Scene/Color';

import tr from '@i18n';
import { PhysicsMotionType } from '@babylonjs/core';

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(0, 0, 0),
  orientation: RotationwUnits.eulerDegrees(0, 0, 0),
};

const GAME_TABLE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(15, -6, 30),
  orientation: RotationwUnits.eulerDegrees(0, 180, 0),
  // scale: { x: 100, y: 100, z: 100 },
};

const LIGHT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(50, 90, 50)
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

const GAME_TABLE_2026: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('2026 Botball Fall Game Table'),
  templateId: 'fallTable26',
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
    geometry: {},
    nodes: {
      'robot': ROBOT,
      'game_table_2026': GAME_TABLE_2026,
      'light0': {
        type: 'point-light',
        intensity: 0.8,
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
        x: Distance.meters(1),
        y: Distance.meters(0.51),
        z: Distance.meters(1.5),
      }
    }),
    gravity: {
      x: Distance.meters(0),
      y: Distance.meters(-9.8),
      z: Distance.meters(0),
    }
  };
}
