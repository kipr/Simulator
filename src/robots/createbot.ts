import Robot from "../state/State/Robot";
import Node from "../state/State/Robot/Node";
import Geometry from "../state/State/Robot/Geometry";
import { Angle, Distance, Mass } from '../util';
import { Vector3 as RawVector3 } from '../math';
import { Rotation, Vector3 } from '../unit-math';

import tr from '@i18n';

const { meters } = Distance;
const { degrees } = Angle;
const { grams } = Mass;

export const CREATEBOT: Robot = {
  name: tr('Createbot'),
  authorId: 'kipr',
  nodes: {
    create: Node.iRobotCreate({
      parentId: 'chassis',
    }),
    chassis: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'chassis_link',
      mass: grams(1160 - 800),
      friction: 0.1,
    }),
    wombat: Node.weight({
      parentId: 'chassis',
      mass: grams(800),
      origin: {
        position: Vector3.meters(-0.08786, 0.063695, 0),
      },
    }),
  },
  geometry: {
    chassis_link: Geometry.remoteMesh({ uri: '/static/chassis.glb' }),
  },
  origin: {
    orientation: Rotation.eulerDegrees(0, -90, 0),
  }
};