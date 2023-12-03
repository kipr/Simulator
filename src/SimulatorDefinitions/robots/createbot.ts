import Robot from "../../state/State/Robot";
import Node from "../../state/State/Robot/Node";
import Geometry from "../../state/State/Robot/Geometry";
import { Angle, Distance, Mass } from '../../util';
import { RawVector3 } from '../../util/math/math';
import { RotationwUnits, Vector3wUnits } from '../../util/math/UnitMath';

import tr from '@i18n';

const { meters } = Distance;
const { degrees } = Angle;
const { grams } = Mass;

export const CREATEBOT: Robot = {
  name: tr('IRobot Create'),
  authorId: 'Chris',
  nodes: {
    create: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'create_link',
      mass: grams(400),
      restitution: 0,
      friction: 0.01,
      inertia: [10, 10, 10]
    }),
    left_wheel: Node.motor({
      parentAxis: RawVector3.create(0, 0, 1),
      parentPivot: Vector3wUnits.meters(0,0.01,-.12),
      childAxis: RawVector3.Y, 
      motorPort: 3,
      parentId: 'create',
      plug: Node.Motor.Plug.Inverted
    }),
    left_wheel_link: Node.link({
      parentId: 'left_wheel',
      geometryId: 'wheel_link',
      collisionBody: Node.Link.CollisionBody.CYLINDER,
      mass: grams(50),
      friction: 100,
      restitution: 0,
      scale: .3,
    }),
    right_wheel: Node.motor({
      parentAxis: RawVector3.create(0, 0, -1),
      parentPivot: Vector3wUnits.meters(0,0.01,0.12),
      childAxis: RawVector3.Y,
      motorPort: 0,
      parentId: 'create',
    }),
    right_wheel_link: Node.link({
      parentId: 'right_wheel',
      geometryId: 'wheel_link',
      collisionBody: Node.Link.CollisionBody.CYLINDER,
      mass: grams(50),
      friction: 100,
      restitution: 0,
      scale: .3,
    }),
    touch_sensor: Node.touchSensor({
      parentId: 'create',
      origin: {
        position: Vector3wUnits.meters(0.10253, -0.007715, -0.011238),
      },
      digitalPort: 0,
      collisionBox: Vector3wUnits.meters(0.015, 0.015, 0.07),
    }),
    reflectance_sensor: Node.reflectanceSensor({
      parentId: 'create',
      origin: {
        position: Vector3wUnits.meters(0.088337, -0.029257, -0.007872),
        orientation: RotationwUnits.eulerDegrees(90, 0, 0),
      },
      analogPort: 1,
    }),
    // et_sensor: Node.etSensor({
    //   parentId: 'arm_link',
    //   origin: {
    //     position: Vector3wUnits.meters(0.137919, -0.018379, 0.004399),
    //     orientation: RotationwUnits.eulerDegrees(0, 90, 0),
    //   },
    //   analogPort: 0,
    // }),
    left_bumper: Node.touchSensor({
      parentId: 'create',
      origin: {
        position: Vector3wUnits.meters(-0.171735, -0.015347, -0.040404),
      },
      digitalPort: 1,
      collisionBox: Vector3wUnits.meters(0.015, 0.015, 0.015),
    }),
    right_bumper: Node.touchSensor({
      parentId: 'create',
      origin: {
        position: Vector3wUnits.meters(-0.171735, -0.015347, 0.040404),
      },
      digitalPort: 2,
      collisionBox: Vector3wUnits.meters(0.015, 0.015, 0.015),
    }),
  },
  geometry: {
    create_link: Geometry.remoteMesh({ uri: '/static/object_binaries/Create2_rotated.glb' }),
    wheel_link: Geometry.remoteMesh({ uri: '/static/object_binaries/wheel.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 90),
  }
};