import Robot from "../../../state/State/Robot";
import Node from "../../../state/State/Robot/Node";
import Geometry from "../../../state/State/Robot/Geometry";
import { Angle, Distance, Mass } from '../../../util';
import { RawVector3 } from '../../../util/math/math';
import { RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';

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
      inertia: [10, 10, 10],
    }),
    create_node: Node.iRobotCreate({
      parentId: 'create'
    }),
    wombat: Node.weight({
      parentId: 'create',
      mass: grams(400),
      origin: {
        position: Vector3wUnits.meters(0.05, 0.013, 0), // forward, up, right
      },
    }),
    left_wheel: Node.motor({
      parentAxis: RawVector3.create(0, 0, 1),
      parentPivot: Vector3wUnits.meters(0,0.015,-.1191),
      childAxis: RawVector3.Y, 
      motorPort: 30,
      parentId: 'create',
      plug: Node.Motor.Plug.Inverted
    }),
    left_wheel_link: Node.link({
      parentId: 'left_wheel',
      geometryId: 'wheel_link', // if deleted Simulator initialization failed TypeError: mesh.subMeshes is undefined
      collisionBody: Node.Link.CollisionBody.CYLINDER,
      mass: grams(20),
      friction: 100,
      restitution: 0,
      scale: .47,
    }),
    right_wheel: Node.motor({
      parentAxis: RawVector3.create(0, 0, -1),
      parentPivot: Vector3wUnits.meters(0,0.015,0.1255),
      childAxis: RawVector3.Y,
      motorPort: 40,
      parentId: 'create',
    }),
    right_wheel_link: Node.link({
      parentId: 'right_wheel',
      geometryId: 'wheel_link',
      collisionBody: Node.Link.CollisionBody.CYLINDER,
      mass: grams(20),
      friction: 100,
      restitution: 0,
      scale: .47,
    }),
    left_front_reflectance_sensor: Node.reflectanceSensor({
      parentId: 'create',
      origin: {
        position: Vector3wUnits.meters(0.15113, 0.013, 0.037505),
        orientation: RotationwUnits.eulerDegrees(90, 0, 0),
      },
      analogPort: 1,
    }),
    left_side_reflectance_sensor: Node.reflectanceSensor({
      parentId: 'create',
      origin: {
        position: Vector3wUnits.meters(0.05989, 0.013, 0.14174),
        orientation: RotationwUnits.eulerDegrees(90, 0, 0),
      },
      analogPort: 2,
    }),
    right_front_reflectance_sensor: Node.reflectanceSensor({
      parentId: 'create',
      origin: {
        position: Vector3wUnits.meters(0.15113, 0.013, -0.043626),
        orientation: RotationwUnits.eulerDegrees(90, 0, 0),
      },
      analogPort: 3,
    }),
    right_side_reflectance_sensor: Node.reflectanceSensor({
      parentId: 'create',
      origin: {
        position: Vector3wUnits.meters(0.05989, 0.013, -0.14174),
        orientation: RotationwUnits.eulerDegrees(90, 0, 0),
      },
      analogPort: 4,
    }),

    left_side_bump: Node.touchSensor({
      parentId: 'create',
      origin: {
        position: Vector3wUnits.meters(-0.171735, -0.015347, -0.040404),
      },
      digitalPort: 1,
      collisionBox: Vector3wUnits.meters(0.015, 0.015, 0.015),
    }),
    right_side_bump: Node.touchSensor({
      parentId: 'create',
      origin: {
        position: Vector3wUnits.meters(-0.171735, -0.015347, 0.040404),
      },
      digitalPort: 2,
      collisionBox: Vector3wUnits.meters(0.015, 0.015, 0.015),
    }),
    left_front_bump: Node.touchSensor({
      parentId: 'create',
      origin: {
        position: Vector3wUnits.meters(-0.171735, -0.015347, -0.040404),
      },
      digitalPort: 3,
      collisionBox: Vector3wUnits.meters(0.015, 0.015, 0.015),
    }),
    right_front_bump: Node.touchSensor({
      parentId: 'create',
      origin: {
        position: Vector3wUnits.meters(-0.171735, -0.015347, 0.040404),
      },
      digitalPort: 4,
      collisionBox: Vector3wUnits.meters(0.015, 0.015, 0.015),
    }),
  },
  geometry: {
    create_link: Geometry.remoteMesh({ uri: '/static/object_binaries/Create2_rotated.glb' }),
    wheel_link: Geometry.remoteMesh({ uri: '/static/object_binaries/wheel.glb' }),
  },
  origin: {
    position: Vector3wUnits.meters(0, 0.5, 0),
    orientation: RotationwUnits.eulerDegrees(0, 0, 45),
  }
};