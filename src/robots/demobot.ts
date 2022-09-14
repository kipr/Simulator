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
    /*wombat: Node.weight({
      parentId: 'chassis',
      mass: grams(800),
      origin: {
        position: Vector3.meters(-0.08786, 0.063695, 0),
      },
    }),*/
    left_wheel: Node.motor({
      parentAxis: RawVector3.NEGATIVE_Z,
      parentPivot: Vector3.metersZ(-0.07492),
      childAxis: RawVector3.Y,
      motorPort: 0,
      parentId: 'chassis',
    }),
    left_wheel_link: Node.link({
      parentId: 'left_wheel',
      geometryId: 'wheel_link',
      collisionBody: Node.Link.CollisionBody.CYLINDER,
      mass: grams(14),
      friction: 25,
    }),
    right_wheel: Node.motor({
      parentAxis: RawVector3.Z,
      parentPivot: Vector3.metersZ(0.07492),
      childAxis: RawVector3.Y,
      motorPort: 3,
      parentId: 'chassis',
    }),
    right_wheel_link: Node.link({
      parentId: 'right_wheel',
      geometryId: 'wheel_link',
      collisionBody: Node.Link.CollisionBody.CYLINDER,
      mass: grams(14),
      friction: 25,
    }),
    arm: Node.servo({
      parentAxis: RawVector3.NEGATIVE_Z,
      parentPivot: Vector3.meters(0.068099, 0.034913, -0.010805),
      childAxis: RawVector3.Y,
      servoPort: 0,
      parentId: 'chassis',
    }),
    arm_link: Node.link({
      parentId: 'arm',
      geometryId: 'arm_link',
      mass: grams(14),
      friction: 5,
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
    }),
    claw: Node.servo({
      parentAxis: RawVector3.NEGATIVE_Z,
      childAxis: RawVector3.NEGATIVE_Y,
      servoPort: 1,
      parentId: 'arm_link',
      parentPivot: Vector3.meters(0.097792, -0.024775, 0.026806),
    }),
    claw_link: Node.link({
      parentId: 'claw',
      geometryId: 'claw_link',
      mass: grams(14),
      friction: 5,
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
    }),
  },
  geometry: {
    chassis_link: Geometry.remoteMesh({ uri: '/static/chassis.glb' }),
    wheel_link: Geometry.remoteMesh({ uri: '/static/wheel.glb' }),
    arm_link: Geometry.remoteMesh({ uri: '/static/arm.glb' }),
    claw_link: Geometry.remoteMesh({ uri: '/static/claw.glb' }),
  }
};