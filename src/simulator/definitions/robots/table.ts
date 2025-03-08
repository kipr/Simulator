import Robot from "../../../state/State/Robot";
import Node from "../../../state/State/Robot/Node";
import Geometry from "../../../state/State/Robot/Geometry";
import { Mass } from '../../../util';
import { RotationwUnits } from '../../../util/math/unitMath';

import tr from '@i18n';

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
    game_table: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'game_table_geo',
      restitution: .2,
      friction: 1,
      mass: Mass.kilograms(20),
    }),
  },
  geometry: {
    game_table_geo: Geometry.remoteMesh({ uri: '/static/object_binaries/2025_game_table.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const HAMBURGER: Robot = {
  name: tr('Hamburger'),
  authorId: 'kipr',
  nodes: {
    hamburger: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'hamburger_geo',
      restitution: .8,
      friction: 1,
      mass: Mass.grams(5),
      inertia: [3, 3, 3],
    }),
  },
  geometry: {
    hamburger_geo: Geometry.remoteMesh({ uri: '/static/object_binaries/hamburger.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const HOTDOG: Robot = {
  name: tr('Hotdog'),
  authorId: 'kipr',
  nodes: {
    hotdog: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'hotdog_geo',
      restitution: .8,
      friction: 1,
      mass: Mass.grams(5),
      inertia: [3, 3, 3],
    }),
  },
  geometry: {
    hotdog_geo: Geometry.remoteMesh({ uri: '/static/object_binaries/hot_dog.glb' }),
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
      geometryId: 'taco_geo',
      restitution: .8,
      friction: 1,
      mass: Mass.grams(5),
      inertia: [3, 3, 3],
    }),
  },
  geometry: {
    taco_geo: Geometry.remoteMesh({ uri: '/static/object_binaries/taco.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

const CUP_MASS = 5;
export const CUP_BLUE: Robot = {
  name: tr('Blue Cup'),
  authorId: 'kipr',
  nodes: {
    cup_blue: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'cup_blue_geo',
      restitution: .4,
      friction: 1,
      mass: Mass.grams(CUP_MASS),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    cup_blue_geo: Geometry.remoteMesh({ uri: '/static/object_binaries/cup_blue.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const CUP_GREEN: Robot = {
  name: tr('Green Cup'),
  authorId: 'kipr',
  nodes: {
    cup_green: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'cup_green_geo',
      restitution: .4,
      friction: 1,
      mass: Mass.grams(CUP_MASS),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    cup_green_geo: Geometry.remoteMesh({ uri: '/static/object_binaries/cup_green.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};
export const CUP_PINK: Robot = {
  name: tr('Pink Cup'),
  authorId: 'kipr',
  nodes: {
    cup_pink: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'cup_pink_geo',
      restitution: .4,
      friction: 1,
      mass: Mass.grams(CUP_MASS),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    cup_pink_geo: Geometry.remoteMesh({ uri: '/static/object_binaries/cup_pink.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const BOTTLE: Robot = {
  name: tr('Water bottle'),
  authorId: 'kipr',
  nodes: {
    bottle: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'bottle_geo',
      restitution: .5,
      friction: 1,
      mass: Mass.grams(3),
      inertia: [3, 3, 3],
    }),
  },
  geometry: {
    bottle_geo: Geometry.remoteMesh({ uri: '/static/object_binaries/bottle.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const TOMATO: Robot = {
  name: tr('Tomato'),
  authorId: 'kipr',
  nodes: {
    tomato: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'tomato_geo',
      restitution: .7,
      friction: 1,
      mass: Mass.grams(5),
      inertia: [2, 2, 2],
    }),
  },
  geometry: {
    tomato_geo: Geometry.remoteMesh({ uri: '/static/object_binaries/tomato.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const PICKLE: Robot = {
  name: tr('Pickle'),
  authorId: 'kipr',
  nodes: {
    pickle: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'pickle_geo',
      restitution: .7,
      friction: .7,
      mass: Mass.grams(1),
      inertia: [3, 3, 3],
    }),
  },
  geometry: {
    pickle_geo: Geometry.remoteMesh({ uri: '/static/object_binaries/pickle.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const POTATO: Robot = {
  name: tr('Potato'),
  authorId: 'kipr',
  nodes: {
    potato: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'potato_geo',
      restitution: .7,
      friction: 1,
      mass: Mass.grams(3),
      inertia: [2, 2, 2],
    }),
  },
  geometry: {
    potato_geo: Geometry.remoteMesh({ uri: '/static/object_binaries/potato.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const TRAY: Robot = {
  name: tr('Tray'),
  authorId: 'kipr',
  nodes: {
    tray: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'tray_geo',
      restitution: .1,
      friction: .7,
      mass: Mass.grams(10),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    tray_geo: Geometry.remoteMesh({ uri: '/static/object_binaries/tray.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const BOTGUY: Robot = {
  name: tr('Botguy'),
  authorId: 'kipr',
  nodes: {
    botguy: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'botguy_geo',
      restitution: .1,
      friction: .7,
      mass: Mass.grams(5),
      inertia: [2, 2, 2],
    }),
  },
  geometry: {
    botguy_geo: Geometry.remoteMesh({ uri: '/static/object_binaries/botguy.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};