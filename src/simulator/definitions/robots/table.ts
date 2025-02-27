import Robot from "../../../state/State/Robot";
import Node from "../../../state/State/Robot/Node";
import Geometry from "../../../state/State/Robot/Geometry";
// import { Angle, Distance, Mass } from '../../../util';
import { Mass } from '../../../util';
// import { RawVector3 } from '../../../util/math/math';
// import { RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { RotationwUnits } from '../../../util/math/unitMath';

import tr from '@i18n';

// const { meters } = Distance;
// const { degrees } = Angle;
// const { grams } = Mass;

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
    table: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'table',
      restitution: .2,
      friction: 1,
      mass: Mass.kilograms(20),
    }),
  },
  geometry: {
    table: Geometry.remoteMesh({ uri: '/static/object_binaries/2025_game_table.glb' }),
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
      geometryId: 'hamburger',
      restitution: .8,
      friction: 1,
      mass: Mass.grams(5),
      inertia: [3, 3, 3],
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
    hotdog: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'hotdog',
      restitution: .8,
      friction: 1,
      mass: Mass.grams(5),
      inertia: [3, 3, 3],
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
    taco: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'taco',
      restitution: .8,
      friction: 1,
      mass: Mass.grams(5),
      inertia: [3, 3, 3],
    }),
  },
  geometry: {
    taco: Geometry.remoteMesh({ uri: '/static/object_binaries/taco.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

const CUP_MASS = 5;
export const CUP_PINK: Robot = {
  name: tr('Pink Cup'),
  authorId: 'kipr',
  nodes: {
    cup_pink: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'cup_pink',
      restitution: .4,
      friction: 1,
      mass: Mass.grams(CUP_MASS),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    cup_pink: Geometry.remoteMesh({ uri: '/static/object_binaries/cup_pink.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const CUP_BLUE: Robot = {
  name: tr('Blue Cup'),
  authorId: 'kipr',
  nodes: {
    cup_blue: Node.link({
      collisionBody: Node.Link.CollisionBody.EMBEDDED,
      geometryId: 'cup_blue',
      restitution: .4,
      friction: 1,
      mass: Mass.grams(CUP_MASS),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    cup_blue: Geometry.remoteMesh({ uri: '/static/object_binaries/cup_blue.glb' }),
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
      geometryId: 'cup_green',
      restitution: .4,
      friction: 1,
      mass: Mass.grams(CUP_MASS),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    cup_green: Geometry.remoteMesh({ uri: '/static/object_binaries/cup_green.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const POM_BLUE: Robot = {
  name: tr('Blue pom'),
  authorId: 'kipr',
  nodes: {
    pom_blue: Node.link({
      collisionBody: Node.Link.CollisionBody.BOX,
      geometryId: 'pom_blue',
      restitution: .4,
      friction: 1,
      mass: Mass.grams(1),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    pom_blue: Geometry.remoteMesh({ uri: '/static/object_binaries/pom_blue.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const POM_RED: Robot = {
  name: tr('Red pom'),
  authorId: 'kipr',
  nodes: {
    pom_red: Node.link({
      collisionBody: Node.Link.CollisionBody.BOX,
      geometryId: 'pom_red',
      restitution: .4,
      friction: .7,
      mass: Mass.grams(1),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    pom_red: Geometry.remoteMesh({ uri: '/static/object_binaries/pom_red.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const POM_ORANGE: Robot = {
  name: tr('Orange pom'),
  authorId: 'kipr',
  nodes: {
    pom_orange: Node.link({
      collisionBody: Node.Link.CollisionBody.BOX,
      geometryId: 'pom_orange',
      restitution: .4,
      friction: .7,
      mass: Mass.grams(1),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    pom_orange: Geometry.remoteMesh({ uri: '/static/object_binaries/pom_orange.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const POM_YELLOW: Robot = {
  name: tr('Yellow pom'),
  authorId: 'kipr',
  nodes: {
    pom_yellow: Node.link({
      collisionBody: Node.Link.CollisionBody.BOX,
      geometryId: 'pom_yellow',
      restitution: .4,
      friction: .7,
      mass: Mass.grams(1),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    pom_yellow: Geometry.remoteMesh({ uri: '/static/object_binaries/pom_yellow.glb' }),
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
      geometryId: 'bottle',
      restitution: .5,
      friction: 1,
      mass: Mass.grams(3),
      inertia: [3, 3, 3],
    }),
  },
  geometry: {
    bottle: Geometry.remoteMesh({ uri: '/static/object_binaries/bottle.glb' }),
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
      geometryId: 'tomato',
      restitution: .7,
      friction: 1,
      mass: Mass.grams(5),
      inertia: [2, 2, 2],
    }),
  },
  geometry: {
    tomato: Geometry.remoteMesh({ uri: '/static/object_binaries/tomato.glb' }),
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
      geometryId: 'pickle',
      restitution: .7,
      friction: .7,
      mass: Mass.grams(1),
      inertia: [3, 3, 3],
    }),
  },
  geometry: {
    pickle: Geometry.remoteMesh({ uri: '/static/object_binaries/pickle.glb' }),
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
      geometryId: 'potato',
      restitution: .7,
      friction: 1,
      mass: Mass.grams(3),
      inertia: [2, 2, 2],
    }),
  },
  geometry: {
    potato: Geometry.remoteMesh({ uri: '/static/object_binaries/potato.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const FRY: Robot = {
  name: tr('French fry'),
  authorId: 'kipr',
  nodes: {
    french_fry: Node.link({
      collisionBody: Node.Link.CollisionBody.BOX,
      geometryId: 'french_fry',
      restitution: .3,
      friction: .7,
      mass: Mass.grams(CUP_MASS),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    french_fry: Geometry.remoteMesh({ uri: '/static/object_binaries/french_fry.glb' }),
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
      geometryId: 'tray',
      restitution: .1,
      friction: .7,
      mass: Mass.grams(10),
      inertia: [1, 1, 1],
    }),
  },
  geometry: {
    tray: Geometry.remoteMesh({ uri: '/static/object_binaries/tray.glb' }),
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
      geometryId: 'botguy',
      restitution: .1,
      friction: .7,
      mass: Mass.grams(5),
      inertia: [2, 2, 2],
    }),
  },
  geometry: {
    botguy: Geometry.remoteMesh({ uri: '/static/object_binaries/botguy.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};

export const DRINK_BLUE: Robot = {
  name: tr('Blue Drink'),
  authorId: 'kipr',
  nodes: {
    drink_blue: Node.link({
      collisionBody: Node.Link.CollisionBody.BOX,
      geometryId: 'drink_blue',
      restitution: .1,
      friction: .5,
      mass: Mass.grams(5),
      inertia: [2, 2, 2],
    }),
  },
  geometry: {
    drink_blue: Geometry.remoteMesh({ uri: '/static/object_binaries/drink_blue.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};
export const DRINK_GREEN: Robot = {
  name: tr('Green Drink'),
  authorId: 'kipr',
  nodes: {
    drink_green: Node.link({
      collisionBody: Node.Link.CollisionBody.BOX,
      geometryId: 'drink_green',
      restitution: .1,
      friction: .5,
      mass: Mass.grams(5),
      inertia: [2, 2, 2],
    }),
  },
  geometry: {
    drink_green: Geometry.remoteMesh({ uri: '/static/object_binaries/drink_green.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};
export const DRINK_PINK: Robot = {
  name: tr('Pink Drink'),
  authorId: 'kipr',
  nodes: {
    drink_pink: Node.link({
      collisionBody: Node.Link.CollisionBody.BOX,
      geometryId: 'drink_pink',
      restitution: .1,
      friction: .5,
      mass: Mass.grams(5),
      inertia: [2, 2, 2],
    }),
  },
  geometry: {
    drink_pink: Geometry.remoteMesh({ uri: '/static/object_binaries/drink_pink.glb' }),
  },
  origin: {
    orientation: RotationwUnits.eulerDegrees(0, 0, 0),
  }
};