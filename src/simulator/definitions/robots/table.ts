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

export const GAME_TABLE_2025: Robot = {
  name: tr('Game Table'),
  authorId: 'kipr',
  nodes: {
    chassis: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'game_table_2025',
      restitution: .3,
      friction: 1,
      mass: Mass.kilograms(20),
    }),
  },
  geometry: {
    game_table_2025: Geometry.remoteMesh({ uri: '/static/object_binaries/2025_game_table.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const HAMBURGER: Robot = {
  name: tr('Hamburger'),
  authorId: 'kipr',
  nodes: {
    chassis: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'hamburger',
      restitution: .9,
      friction: .3,
      mass: Mass.grams(10),
    }),
  },
  geometry: {
    hamburger: Geometry.remoteMesh({ uri: '/static/object_binaries/hamburger.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const HOTDOG: Robot = {
  name: tr('Hotdog'),
  authorId: 'kipr',
  nodes: {
    chassis: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'hotdog',
      restitution: .9,
      friction: .3,
      mass: Mass.grams(10),
    }),
  },
  geometry: {
    hotdog: Geometry.remoteMesh({ uri: '/static/object_binaries/hot_dog.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const TACO: Robot = {
  name: tr('Taco'),
  authorId: 'kipr',
  nodes: {
    chassis: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'taco',
      restitution: .9,
      friction: .3,
      mass: Mass.grams(10),
    }),
  },
  geometry: {
    taco: Geometry.remoteMesh({ uri: '/static/object_binaries/taco.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};