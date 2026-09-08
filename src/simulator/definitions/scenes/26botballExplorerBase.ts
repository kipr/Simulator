import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Node from '../../../state/State/Scene/Node';
import Camera from '../../../state/State/Scene/Camera';
import Scene from '../../../state/State/Scene';
import AbstractRobot from '../../../programming/AbstractRobot';
import Author from '../../../db/Author';
import {
  BOTBALL_EXPLORER_TABLE_26_GEOMETRY,
  BOTBALL_EXPLORER_TABLE_26_NODES,
} from './2026BotballExplorerTable';

import tr from '@i18n';

const ROBOT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(0, 0, 0),
  orientation: RotationwUnits.eulerDegrees(0, 90, 0),
};

const LIGHT_ORIGIN: ReferenceFramewUnits = {
  position: Vector3wUnits.centimeters(54, 105, 50)
};

/**
 * Special demobot with no collision box over the reflectance sensor.
 * When it has the collider, it can't drive straight up the ramp because the
 * wheels always leave the ground.
 */
const ROBOT: Node.Robot = {
  type: 'robot',
  name: tr('Robot'),
  robotId: 'demobot',
  state: AbstractRobot.Stateless.NIL,
  editable: true,
  visible: true,
  startingOrigin: ROBOT_ORIGIN,
  origin: ROBOT_ORIGIN
};

export function createBaseSceneSurface(): Scene {
  return {
    name: tr('Base Scene - 2026 Botball Explorer Game Table'),
    description: tr('A base scene. Intended to be augmented to create the full Botball Explorer game table'),
    author: Author.organization('kipr'),
    geometry: { ...BOTBALL_EXPLORER_TABLE_26_GEOMETRY },
    nodes: {
      'robot': ROBOT,
      ...BOTBALL_EXPLORER_TABLE_26_NODES,
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
        x: Distance.meters(0.04),
        y: Distance.meters(0.2),
        z: Distance.meters(0),
      },
      position: {
        x: Distance.meters(-0.71),
        y: Distance.meters(0.9),
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
