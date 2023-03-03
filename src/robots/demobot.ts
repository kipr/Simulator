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

export const DEMOBOT: Robot = {
  name: tr('Demobot'),
  authorId: 'kipr',
  nodes: {
    chassis: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'chassis_link',
      mass: grams(1160 - 800),
      friction: 0.1,
    }),
    lightSensor: Node.lightSensor({
      parentId: 'chassis',
      origin: {
        position: Vector3.meters(0.3, 0, 0),
        orientation: Rotation.eulerDegrees(90, 0, 0),
      },
      analogPort: 3,
    }),
    wombat: Node.weight({
      parentId: 'chassis',
      mass: grams(800),
      origin: {
        position: Vector3.meters(-0.08786, 0.063695, 0),
      },
    }),
    left_wheel: Node.motor({
      parentAxis: RawVector3.NEGATIVE_Z,
      parentPivot: Vector3.metersZ(-0.07492),
      childAxis: RawVector3.Y,
      motorPort: 3,
      parentId: 'chassis',
      plug: Node.Motor.Plug.Inverted
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
      motorPort: 0,
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
      childTwist:degrees(65),
      servoPort: 0,
      parentId: 'chassis',
    }),
    arm_link: Node.link({
      parentId: 'arm',
      geometryId: 'arm_link',
      mass: grams(14),
      friction: 50,
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
    }),
    claw: Node.servo({
      parentAxis: RawVector3.Z,
      childAxis: RawVector3.Y,
      childTwist: degrees(0),
      servoPort: 3,
      parentId: 'arm_link',
      parentPivot: Vector3.meters(0.097792, -0.024775, 0.026806),
    }),
    claw_link: Node.link({
      parentId: 'claw',
      geometryId: 'claw_link',
      mass: grams(14),
      friction: 50,
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
    }),
    touch_sensor: Node.touchSensor({
      parentId: 'chassis',
      origin: {
        position: Vector3.meters(0.10253, -0.007715, -0.011238),
      },
      digitalPort: 0,
      collisionBox: Vector3.meters(0.015, 0.015, 0.07),
    }),
    reflectance_sensor: Node.reflectanceSensor({
      parentId: 'chassis',
      origin: {
        position: Vector3.meters(0.088337, -0.029257, -0.007872),
        orientation: Rotation.eulerDegrees(90, 0, 0),
      },
      analogPort: 1,
    }),
    et_sensor: Node.etSensor({
      parentId: 'arm_link',
      origin: {
        position: Vector3.meters(0.137919, -0.018379, 0.004399),
        orientation: Rotation.eulerDegrees(0, 90, 0),
      },
      analogPort: 0,
    }),
    left_bumper: Node.touchSensor({
      parentId: 'chassis',
      origin: {
        position: Vector3.meters(-0.171735, -0.015347, -0.040404),
      },
      digitalPort: 1,
      collisionBox: Vector3.meters(0.015, 0.015, 0.015),
    }),
    right_bumper: Node.touchSensor({
      parentId: 'chassis',
      origin: {
        position: Vector3.meters(-0.171735, -0.015347, 0.040404),
      },
      digitalPort: 2,
      collisionBox: Vector3.meters(0.015, 0.015, 0.015),
    }),
  },
  geometry: {
    chassis_link: Geometry.remoteMesh({ uri: '/static/chassis.glb' }),
    wheel_link: Geometry.remoteMesh({ uri: '/static/wheel.glb' }),
    arm_link: Geometry.remoteMesh({ uri: '/static/arm.glb' }),
    claw_link: Geometry.remoteMesh({ uri: '/static/claw.glb' }),
  },
  origin: {
    orientation: Rotation.eulerDegrees(0, -90, 0),
  }
};