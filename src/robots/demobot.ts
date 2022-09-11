import Robot from "../state/State/Robot";
import Node from "../state/State/Robot/Node";
import Geometry from "../state/State/Robot/Geometry";
import { Angle, Distance, Mass } from '../util';
import { Vector3 as RawVector3 } from '../math';
import { Rotation, Vector3 } from '../unit-math';

const { meters } = Distance;
const { degrees } = Angle;
const { grams } = Mass;

export const DEMOBOT: Robot = {
  name: {
    'en': 'Demobot',
  },
  authorId: 'kipr',
  nodes: {
    chassis: Node.link({
      name: {
        'en': 'Chassis',
      },
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'chassis_link',
      mass: grams(1126 - 800),
      friction: 0.1,
    }),
    wombat: Node.weight({
      parentId: 'chassis',
      mass: grams(800),
      origin: {
        position: Vector3.meters(0.0, 0.063695, 0.08786),
      },
    }),
    left_wheel: Node.motor({
      axis: RawVector3.create(1, 0, 0),
      motorPort: 0,
      parentId: 'chassis',
      origin: {
        position: Vector3.meters(0.07492, 0.033136, 0.0),
      }
    }),
    left_wheel_link: Node.link({
      parentId: 'left_wheel',
      geometryId: 'wheel_link',
      collisionBody: Node.Link.CollisionBody.CYLINDER,
      mass: grams(14),
      friction: 25,
      origin: {
        orientation: Rotation.eulerDegrees(0, 0, -90),
      }
    }),
    right_wheel: Node.motor({
      axis: RawVector3.create(1, 0, 0),
      motorPort: 3,
      parentId: 'chassis',
      origin: {
        position: Vector3.meters(-0.07492, 0.033136, 0.0),
      }
    }),
    right_wheel_link: Node.link({
      parentId: 'right_wheel',
      geometryId: 'wheel_link',
      collisionBody: Node.Link.CollisionBody.CYLINDER,
      mass: grams(14),
      friction: 25,
      origin: {
        orientation: Rotation.eulerDegrees(0, 0, 90),
      }
    }),
    arm: Node.servo({
      axis: RawVector3.create(-1, 0, 0),
      servoPort: 0,
      parentId: 'chassis',
      origin: {
        position: Vector3.meters(-0.010805, 0.068099, -0.068379),
      }
    }),
    arm_link: Node.link({
      parentId: 'arm',
      geometryId: 'arm_link',
      mass: grams(14),
      friction: 5,
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      origin: {
        orientation: Rotation.eulerDegrees(-90, 0, 90),
      }
    }),
  },
  geometry: {
    chassis_link: Geometry.remoteMesh({ uri: '/static/chassis.glb' }),
    wheel_link: Geometry.remoteMesh({ uri: '/static/wheel.glb' }),
    arm_link: Geometry.remoteMesh({ uri: '/static/arm.glb' })
  }
};