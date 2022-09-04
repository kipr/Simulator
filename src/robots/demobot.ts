import Robot from "../state/State/Robot";
import Node from "../state/State/Robot/Node";
import Geometry from "../state/State/Robot/Geometry";
import { Angle, Distance, Mass } from '../util';
import { Vector3 as RawVector3 } from '../math';
import { Rotation } from '../unit-math';

export const DEMOBOT: Robot = {
  name: {
    'en': 'Demobot',
  },
  authorId: 'kipr',
  nodes: {
    chassis: {
      type: Node.Type.Link,
      name: {
        'en': 'Chassis',
      },
      collisionBody: {
        type: Node.Link.CollisionBody.Type.Embedded,
      },
      geometryId: 'chassis_link',
      mass: Mass.grams(1126 - 800),
      friction: 0.1,
    },
    wombat: {
      type: Node.Type.Weight,
      parentId: 'chassis',
      mass: Mass.grams(800),
      origin: {
        position: {
          x: Distance.meters(0.0),
          y: Distance.meters(0.063695),
          z: Distance.meters(0.08786),
        }
      },
    },
    left_wheel: {
      type: Node.Type.Motor,
      axis: RawVector3.create(1, 0, 0),
      motorPort: 0,
      parentId: 'chassis',
      origin: {
        position: {
          x: Distance.meters(-0.07492),
          y: Distance.meters(0.033136),
          z: Distance.meters(0.0),
        }
      }
    },
    left_wheel_link: {
      type: Node.Type.Link,
      parentId: 'left_wheel',
      geometryId: 'wheel_link',
      collisionBody: {
        type: Node.Link.CollisionBody.Type.Cylinder,
      },
      mass: Mass.grams(14),
      friction: 25,
      origin: {
        orientation: {
          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(0),
          z: Angle.degrees(90),
        }
      }
    },
    right_wheel: {
      type: Node.Type.Motor,
      axis: RawVector3.create(1, 0, 0),
      motorPort: 0,
      parentId: 'chassis',
      origin: {
        position: {
          x: Distance.meters(0.07492),
          y: Distance.meters(0.033136),
          z: Distance.meters(0.0),
        }
      }
    },
    right_wheel_link: {
      type: Node.Type.Link,
      parentId: 'right_wheel',
      geometryId: 'wheel_link',
      collisionBody: {
        type: Node.Link.CollisionBody.Type.Cylinder,
      },
      mass: Mass.grams(14),
      friction: 25,
      origin: {
        orientation: {
          type: 'euler',
          x: Angle.degrees(0),
          y: Angle.degrees(0),
          z: Angle.degrees(-90),
        }
      }
    }
  },
  geometry: {
    chassis_link: {
      type: Geometry.Type.RemoteMesh,
      uri: '/static/chassis.glb',
    },
    wheel_link: {
      type: Geometry.Type.RemoteMesh,
      uri: '/static/wheel.glb',
    }
  }
};