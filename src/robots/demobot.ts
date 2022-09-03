import Robot from "../state/State/Robot";
import Node from "../state/State/Robot/Node";
import Geometry from "../state/State/Robot/Geometry";
import { Distance, Mass } from '../util';
import { Vector3 as RawVector3 } from '../math';

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
        type: Node.Link.CollisionBody.Type.Box,
      },
      geometryId: 'chassis_link',
      mass: Mass.grams(100),
    },
    left_wheel: {
      type: Node.Type.Motor,
      axis: RawVector3.create(-1, 0, 0),
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