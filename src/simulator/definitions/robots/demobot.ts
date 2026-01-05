import Robot from "../../../state/State/Robot";
import Node from "../../../state/State/Robot/Node";
import Geometry from "../../../state/State/Robot/Geometry";
import { Angle, Distance, Mass } from '../../../util';
import { RawVector3 } from '../../../util/math/math';
import { RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';

import tr from '@i18n';
import { Quaternion } from "@babylonjs/core";

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
      mass: grams(1000),
      restitution: 0,
      friction: 0.01,
      inertia: [10, 10, 10]
    }),
    lightSensor: Node.lightSensor({
      parentId: 'chassis',
      origin: {
        position: Vector3wUnits.centimeters(0, 3.5, 0),
        orientation: RotationwUnits.eulerDegrees(90, 0, 0),
      },
      analogPort: 2,
    }),
    wombat: Node.weight({
      parentId: 'chassis',
      mass: grams(300),
      origin: {
        position: Vector3wUnits.meters(-0.06, -0.019, 0),
        // position: Vector3wUnits.meters(-0.08786, 0.063695, 0),
      },
    }),
    left_wheel: Node.motor({
      parentPivot: Vector3wUnits.metersX(-0.07492),
      parentAxis: RawVector3.NEGATIVE_Y,
      childAxis: RawVector3.NEGATIVE_Z,
      parentPerpAxis: RawVector3.NEGATIVE_Z,
      childPerpAxis: RawVector3.NEGATIVE_X,
      childRotationQuaternion: Quaternion.FromEulerAngles(0, 0, Math.PI / -2),
      motorPort: 3,
      parentId: 'chassis',
      plug: Node.Motor.Plug.Inverted
    }),
    left_wheel_link: Node.link({
      parentId: 'left_wheel',
      geometryId: 'wheel_link',
      collisionBody: Node.Link.CollisionBody.CYLINDER,
      mass: grams(50),
      friction: 100,
      restitution: 0,
    }),
    right_wheel: Node.motor({
      parentPivot: Vector3wUnits.metersX(0.07492),
      parentAxis: RawVector3.NEGATIVE_Y,
      childAxis: RawVector3.NEGATIVE_Z,
      parentPerpAxis: RawVector3.NEGATIVE_Z,
      childPerpAxis: RawVector3.NEGATIVE_X,
      childRotationQuaternion: Quaternion.FromEulerAngles(0, 0, Math.PI / -2),
      motorPort: 0,
      parentId: 'chassis',
    }),
    right_wheel_link: Node.link({
      parentId: 'right_wheel',
      geometryId: 'wheel_link',
      collisionBody: Node.Link.CollisionBody.CYLINDER,
      mass: grams(50),
      friction: 100,
      restitution: 0,
    }),
    arm: Node.servo({
      // parentPivot: Vector3wUnits.meters(0.068099, 0.034913, -0.010805),
      // parentPivot: Vector3wUnits.meters(-0.010805, 0.034913, 0.068099),
      parentPivot: Vector3wUnits.centimeters(1.0805, 3.4913, 8.05),
      parentAxis: RawVector3.Y,
      childAxis: RawVector3.Z,
      parentPerpAxis: RawVector3.Z,
      childPerpAxis: RawVector3.X,
      // childRotationQuaternion: Quaternion.FromEulerAngles(Math.PI / 2, Math.PI / 2, 0),
      childRotationQuaternion: Quaternion.FromEulerAngles(-Math.PI / 2, -Math.PI / 2, 0),
      childTwist: degrees(63),
      servoPort: 0,
      parentId: 'chassis',
    }),
    arm_link: Node.link({
      parentId: 'arm',
      geometryId: 'arm_link',
      mass: grams(14),
      friction: 50,
      restitution: 0,
      inertia: [6, 6, 6],
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
    }),
    claw: Node.servo({
      parentAxis: RawVector3.X,
      childAxis: RawVector3.NEGATIVE_Z,
      parentPerpAxis: RawVector3.NEGATIVE_Y,
      childPerpAxis: RawVector3.X,
      childRotationQuaternion: Quaternion.FromEulerAngles(0, -Math.PI / 2, -Math.PI / 2),
      childTwist: degrees(-90),
      servoPort: 3,
      parentId: 'arm_link',
      parentPivot: Vector3wUnits.meters(0.097792, -0.024775, 0.026806),
    }),
    claw_link: Node.link({
      parentId: 'claw',
      geometryId: 'claw_link',
      mass: grams(7),
      friction: 100,
      restitution: 0,
      inertia: [3, 3, 3],
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
    }),
    /*
    touch_sensor: Node.touchSensor({
      parentId: 'chassis',
      origin: {
        position: Vector3wUnits.meters(0.10253, -0.007715, -0.011238),
      },
      digitalPort: 0,
      collisionBox: Vector3wUnits.meters(0.015, 0.015, 0.07),
    }),
    reflectance_sensor: Node.reflectanceSensor({
      parentId: 'chassis',
      origin: {
        position: Vector3wUnits.meters(0.088337, -0.029257, -0.007872),
        orientation: RotationwUnits.eulerDegrees(90, 0, 0),
      },
      analogPort: 1,
    }),
    et_sensor: Node.etSensor({
      parentId: 'arm_link',
      origin: {
        position: Vector3wUnits.meters(0.137919, -0.018379, 0.004399),
        orientation: RotationwUnits.eulerDegrees(0, 90, 0),
      },
      analogPort: 0,
    }),
    left_bumper: Node.touchSensor({
      parentId: 'chassis',
      origin: {
        position: Vector3wUnits.meters(-0.171735, -0.015347, -0.040404),
      },
      digitalPort: 1,
      collisionBox: Vector3wUnits.meters(0.015, 0.015, 0.015),
    }),
    right_bumper: Node.touchSensor({
      parentId: 'chassis',
      origin: {
        position: Vector3wUnits.meters(-0.171735, -0.015347, 0.040404),
      },
      digitalPort: 2,
      collisionBox: Vector3wUnits.meters(0.015, 0.015, 0.015),
    }),
    */
  },
  geometry: {
    chassis_link: Geometry.remoteMesh({ uri: '/static/object_binaries/chassis.glb' }),
    wheel_link: Geometry.remoteMesh({ uri: '/static/object_binaries/wheel.glb' }),
    arm_link: Geometry.remoteMesh({ uri: '/static/object_binaries/arm.glb' }),
    claw_link: Geometry.remoteMesh({ uri: '/static/object_binaries/claw.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};
