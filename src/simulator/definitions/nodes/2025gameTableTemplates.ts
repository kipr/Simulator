import Dict from "../../../util/objectOps/Dict";
import Geometry from "../../../state/State/Scene/Geometry";
import Node from "../../../state/State/Scene/Node";
import { Mass } from "../../../util";
import { PhysicsMotionType } from "@babylonjs/core";

// TODO: Consider deep-freezing all of these objects

const gameTable2025Template: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'game_table_2025',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.STATIC,
    restitution: .2,
    friction: 1,
  },
};

const DRINK_PHYSICS: Node.Physics = {
  type: 'box',
  restitution: .1,
  friction: .5,
  mass: Mass.grams(5),
  inertia: [2, 2, 2]
};
const drinkBlueTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'drink_blue',
  physics: DRINK_PHYSICS
};
const drinkGreenTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'drink_green',
  physics: DRINK_PHYSICS
};
const drinkPinkTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'drink_pink',
  physics: DRINK_PHYSICS
};

const pomBlueTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pom_blue',
  physics: {
    type: 'box',
    restitution: .4,
    friction: 1,
    mass: Mass.grams(1),
    inertia: [1, 1, 1]
  },
};

const BIG_POM_PHYSICS: Node.Physics = {
  type: 'box',
  restitution: .4,
  friction: .7,
  mass: Mass.grams(1),
  inertia: [3, 3, 3]
};
const pomOrangeTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pom_orange',
  physics: BIG_POM_PHYSICS
};
const pomRedTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pom_red',
  physics: BIG_POM_PHYSICS
};
const pomYellowTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pom_yellow',
  physics: BIG_POM_PHYSICS
};

const frenchFryTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'fry',
  physics: {
    type: 'box',
    restitution: .5,
    friction: .6,
    mass: Mass.grams(2),
    inertia: [4, 4, 4]
  },
};
const hamburgerTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'hamburger',
  physics: {
    type: 'mesh',
    restitution: .8,
    friction: 1,
    mass: Mass.grams(5),
    inertia: [3, 3, 3],
  },
};
const hotdogTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'hotdog',
  physics: {
    type: 'mesh',
    restitution: .8,
    friction: 1,
    mass: Mass.grams(5),
    inertia: [3, 3, 3],
  },
};
const tacoTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'taco',
  physics: {
    type: 'mesh',
    restitution: .8,
    friction: 1,
    mass: Mass.grams(5),
    inertia: [3, 3, 3],
  },
};

const CUP_PHYSICS: Node.Physics = {
  colliderId: "collider-box-cup",
  type: 'mesh',
  restitution: .4,
  friction: 1,
  mass: Mass.grams(5),
  inertia: [3, 3, 3],
};
const cupBlueTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cup_blue',
  physics: CUP_PHYSICS
};
const cupGreenTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cup_green',
  physics: CUP_PHYSICS
};
const cupPinkTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cup_pink',
  physics: CUP_PHYSICS
};

const bottleTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'bottle',
  physics: {
    type: 'mesh',
    restitution: .5,
    friction: 1,
    mass: Mass.grams(3),
    inertia: [3, 3, 3],
  }
};
const tomatoTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'tomato',
  physics: {
    type: 'mesh',
    restitution: .5,
    friction: 1,
    mass: Mass.grams(5),
    inertia: [2, 2, 2],
  }
};
const pickleTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pickle',
  physics: {
    type: 'mesh',
    restitution: .7,
    friction: .7,
    mass: Mass.grams(1),
    inertia: [3, 3, 3],
  }
};
const potatoTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'potato',
  physics: {
    type: 'mesh',
    restitution: .7,
    friction: 1,
    mass: Mass.grams(3),
    inertia: [2, 2, 2],
  }
};
const trayTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'tray',
  physics: {
    type: 'mesh',
    restitution: .1,
    friction: .7,
    mass: Mass.grams(10),
    inertia: [1, 1, 1],
  }
};
const botguyGamepieceTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'botguy_gamepiece',
  physics: {
    type: 'mesh',
    restitution: .1,
    friction: .7,
    mass: Mass.grams(5),
    inertia: [2, 2, 2],
  }
};

export const BB2025Templates = Object.freeze<Dict<Node.TemplatedNode<Node>>>({
  'game_table_2025': gameTable2025Template,
  'drink_blue': drinkBlueTemplate,
  'drink_green': drinkGreenTemplate,
  'drink_pink': drinkPinkTemplate,
  'pom_blue': pomBlueTemplate,
  'pom_orange': pomOrangeTemplate,
  'pom_red': pomRedTemplate,
  'pom_yellow': pomYellowTemplate,
  'french_fry': frenchFryTemplate,
  'hamburger': hamburgerTemplate,
  'hotdog': hotdogTemplate,
  'taco': tacoTemplate,
  'cup_blue': cupBlueTemplate,
  'cup_green': cupGreenTemplate,
  'cup_pink': cupPinkTemplate,
  'bottle': bottleTemplate,
  'tomato': tomatoTemplate,
  'pickle': pickleTemplate,
  'potato': potatoTemplate,
  'tray': trayTemplate,
  'botguy_gamepiece': botguyGamepieceTemplate,
});


export const BB2025Geometries = Object.freeze<Dict<Geometry>>({
  'game_table_2025': {
    type: 'file',
    uri: '/static/object_binaries/2025_game_table.glb',
  },
  'drink_blue': {
    type: 'file',
    uri: '/static/object_binaries/drink_blue.glb',
  },
  'drink_green': {
    type: 'file',
    uri: '/static/object_binaries/drink_green.glb',
  },
  'drink_pink': {
    type: 'file',
    uri: '/static/object_binaries/drink_pink.glb',
  },
  'pom_blue': {
    type: 'file',
    uri: '/static/object_binaries/pom_blue.glb',
  },
  'pom_orange': {
    type: 'file',
    uri: '/static/object_binaries/pom_orange.glb',
  },
  'pom_red': {
    type: 'file',
    uri: '/static/object_binaries/pom_red.glb',
  },
  'pom_yellow': {
    type: 'file',
    uri: '/static/object_binaries/pom_yellow.glb',
  },
  'fry': {
    type: 'file',
    uri: '/static/object_binaries/french_fry.glb',
  },
  'hamburger': {
    type: 'file',
    uri: '/static/object_binaries/hamburger.glb',
  },
  'hotdog': {
    type: 'file',
    uri: '/static/object_binaries/hot_dog.glb',
  },
  'taco': {
    type: 'file',
    uri: '/static/object_binaries/taco.glb',
  },
  'cup_blue': {
    type: 'file',
    uri: '/static/object_binaries/cup_blue.glb',
  },
  'cup_green': {
    type: 'file',
    uri: '/static/object_binaries/cup_green.glb',
  },
  'cup_pink': {
    type: 'file',
    uri: '/static/object_binaries/cup_pink.glb',
  },
  'bottle': {
    type: 'file',
    uri: '/static/object_binaries/bottle.glb',
  },
  'tomato': {
    type: 'file',
    uri: '/static/object_binaries/tomato.glb',
  },
  'pickle': {
    type: 'file',
    uri: '/static/object_binaries/pickle.glb',
  },
  'potato': {
    type: 'file',
    uri: '/static/object_binaries/potato.glb',
  },
  'tray': {
    type: 'file',
    uri: '/static/object_binaries/tray.glb',
  },
  'botguy_gamepiece': {
    type: 'file',
    uri: '/static/object_binaries/botguy.glb',
  },
});