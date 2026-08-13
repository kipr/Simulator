import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Node from '../../../state/State/Scene/Node';
import Camera from '../../../state/State/Scene/Camera';
import Scene from '../../../state/State/Scene';
import AbstractRobot from '../../../programming/AbstractRobot';
import Author from '../../../db/Author';

import tr from '@i18n';

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(-13.6, -15, -4.5),
  orientation: RotationwUnits.eulerDegrees(0, 90, 0),
};

const GAME_TABLE_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(45, -6, 100),
  orientation: RotationwUnits.eulerDegrees(0, 180, 0),
};

const LIGHT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(50, 90, 50)
};

/**
 * Special demobot with no collision box over the reflectance sensor.
 * When it has the collider, it can't drive straight up the ramp because the
 * wheels always leave the ground.
 */
const ROBOT: Node.Robot = {
  type: 'robot',
  name: tr('Robot'),
  robotId: 'demobot_no_reflectance',
  state: AbstractRobot.Stateless.NIL,
  visible: true,
  startingOrigin: ROBOT_ORIGIN,
  origin: ROBOT_ORIGIN
};

const BOTBALL_EXPLORER_GAME_TABLE_2026: Node.FromBBTemplate = {
  type: 'from-bb-template',
  name: tr('2026 Botball Explorer Game Table'),
  templateId: 'botballExplorerTable26',
  visible: true,
  editable: false,
  startingOrigin: GAME_TABLE_ORIGIN,
  origin: GAME_TABLE_ORIGIN
};


export function createBaseSceneSurface(): Scene {
  return {
    name: tr('Base Scene - 2026 Botball Explorer Game Table'),
    description: tr('A base scene. Intended to be augmented to create the full Botball Explorer game table'),
    author: Author.organization('kipr'),
    geometry: {},
    nodes: {
      'robot': ROBOT,
      'botball_explorer_game_table_2026': BOTBALL_EXPLORER_GAME_TABLE_2026,
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
        y: Distance.meters(0.05),
        z: Distance.meters(0),
      },
      position: {
        x: Distance.meters(-0.75),
        y: Distance.meters(0.75),
        z: Distance.meters(-1.25),
      }
    }),
    gravity: {
      x: Distance.meters(0),
      y: Distance.meters(-9.8 * 0.4),
      z: Distance.meters(0),
    }
  };
}
