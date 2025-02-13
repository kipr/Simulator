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

/**
 * I chose to use `Robot` to represent game pieces because
 * some of the game pieces have complicated shapes, so I modeled
 * simpler collision bodies in blender.
 * There was no other obvious way to create objects with invisible
 * collision bodies, but if there is another way I should have done it,
 * then I'm sorry.
 */

export const GAME_TABLE_2025: Robot = {
  name: tr('Game Table'),
  authorId: 'kipr',
  nodes: {
    node: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'model',
      restitution: .3,
      friction: 1,
      mass: Mass.kilograms(20),
    }),
  },
  geometry: {
    model: Geometry.remoteMesh({ uri: '/static/object_binaries/2025_game_table.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const HAMBURGER: Robot = {
  name: tr('Hamburger'),
  authorId: 'kipr',
  nodes: {
    node: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'model',
      restitution: .9,
      friction: .3,
      mass: Mass.grams(10),
      inertia: [10, 10, 10],
    }),
  },
  geometry: {
    model: Geometry.remoteMesh({ uri: '/static/object_binaries/hamburger.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const HOTDOG: Robot = {
  name: tr('Hotdog'),
  authorId: 'kipr',
  nodes: {
    node: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'model',
      restitution: .9,
      friction: .3,
      mass: Mass.grams(10),
      inertia: [10, 10, 10],
    }),
  },
  geometry: {
    model: Geometry.remoteMesh({ uri: '/static/object_binaries/hot_dog.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const TACO: Robot = {
  name: tr('Taco'),
  authorId: 'kipr',
  nodes: {
    taco: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'taco',
      restitution: .9,
      friction: .3,
      mass: Mass.grams(10),
      inertia: [10, 10, 10],
    }),
  },
  geometry: {
    taco: Geometry.remoteMesh({ uri: '/static/object_binaries/taco.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

const cupMassGrams = 31;

export const CUP_PINK: Robot = {
  name: tr('Pink Cup'),
  authorId: 'kipr',
  nodes: {
    node: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'model',
      restitution: .4,
      friction: .7,
      mass: Mass.grams(cupMassGrams),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    model: Geometry.remoteMesh({ uri: '/static/object_binaries/cup_pink.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const CUP_BLUE: Robot = {
  name: tr('Blue Cup'),
  authorId: 'kipr',
  nodes: {
    node: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'model',
      restitution: .4,
      friction: .7,
      mass: Mass.grams(cupMassGrams),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    model: Geometry.remoteMesh({ uri: '/static/object_binaries/cup_blue.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const CUP_GREEN: Robot = {
  name: tr('Green Cup'),
  authorId: 'kipr',
  nodes: {
    node: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'model',
      restitution: .4,
      friction: .7,
      mass: Mass.grams(cupMassGrams),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    model: Geometry.remoteMesh({ uri: '/static/object_binaries/cup_green.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const POM_BLUE: Robot = {
  name: tr('Blue pom'),
  authorId: 'kipr',
  nodes: {
    node: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'model',
      restitution: .4,
      friction: .7,
      mass: Mass.grams(cupMassGrams),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    model: Geometry.remoteMesh({ uri: '/static/object_binaries/pom_blue.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const BOTTLE: Robot = {
  name: tr('Water bottle'),
  authorId: 'kipr',
  nodes: {
    node: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'model',
      restitution: .3,
      friction: .7,
      mass: Mass.grams(cupMassGrams),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    model: Geometry.remoteMesh({ uri: '/static/object_binaries/bottle.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const TOMATO: Robot = {
  name: tr('Tomato'),
  authorId: 'kipr',
  nodes: {
    node: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'model',
      restitution: .7,
      friction: .7,
      mass: Mass.grams(cupMassGrams),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    model: Geometry.remoteMesh({ uri: '/static/object_binaries/tomato.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const PICKLE: Robot = {
  name: tr('Pickle'),
  authorId: 'kipr',
  nodes: {
    node: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'model',
      restitution: .7,
      friction: .7,
      mass: Mass.grams(cupMassGrams),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    model: Geometry.remoteMesh({ uri: '/static/object_binaries/pickle.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};