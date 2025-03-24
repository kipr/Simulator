import Dict from "../../../util/objectOps/Dict";
import { RawVector2 } from "../../../util/math/math";
import { Color } from "../../../state/State/Scene/Color";
import Geometry from "../../../state/State/Scene/Geometry";
import Node from "../../../state/State/Scene/Node";
import { Distance, Mass } from "../../../util";
import { PhysicsMotionType } from "@babylonjs/core";

// TODO: Consider deep-freezing all of these objects

const canTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'can',
  physics: {
    type: 'cylinder',
    mass: Mass.grams(5),
    friction: 0.7,
    restitution: 0.3,
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/textures/Can_Texture.png'
    },
  },
  faceUvs: [RawVector2.ZERO, RawVector2.ZERO, RawVector2.create(1, 0), RawVector2.create(0, 1), RawVector2.ZERO, RawVector2.ZERO],
};

const circleTemplate: Node.TemplatedNode<Node.Obj> = {
  type: "object",
  geometryId: "circle",
  material: {
    type: "pbr",
    emissive: {
      type: "color3",
      color: Color.rgba(255, 255, 255, 0.25),
    },
  },
};


const lifescienceTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'can',
  physics: {
    type: 'cylinder',
    mass: Mass.grams(5),
    friction: 0.7,
    restitution: 0.3,
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/textures/sciencepack/life_science_pack.png'
    },
  },
  faceUvs: [RawVector2.ZERO, RawVector2.ZERO, RawVector2.create(1, 0), RawVector2.create(0, 1), RawVector2.ZERO, RawVector2.ZERO],
};

const radscienceTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'can',
  physics: {
    type: 'cylinder',
    mass: Mass.grams(5),
    friction: 0.7,
    restitution: 0.3,
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/textures/sciencepack/rad_science_pack.png'
    },
  },
  faceUvs: [RawVector2.ZERO, RawVector2.ZERO, RawVector2.create(1, 0), RawVector2.create(0, 1), RawVector2.ZERO, RawVector2.ZERO],
};

const noradscienceTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'can',
  physics: {
    type: 'cylinder',
    mass: Mass.grams(5),
    friction: 0.7,
    restitution: 0.3,
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/textures/sciencepack/no_rad_science_pack.png'
    },
  },
  faceUvs: [RawVector2.ZERO, RawVector2.ZERO, RawVector2.create(1, 0), RawVector2.create(0, 1), RawVector2.ZERO, RawVector2.ZERO],
};

const reamTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'ream',
  physics: {
    type: 'box',
    restitution: .3,
    friction: 1,
    mass: Mass.pounds(5),
  },
  material: {
    type: 'basic',
    color: {
      type: 'color3',
      color: Color.Rgb.create(250, 250, 250),
    },
  },
};

const matATemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'mat',
  physics: {
    type: 'box',
    motionType: PhysicsMotionType.STATIC,
    restitution: .3,
    friction: 1,
  },
  material: {
    type: 'basic',
    color: {
      type: "texture",
      uri: "/static/textures/KIPR_Surface_A.png"
    },
  },
};

const matBTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'mat',
  physics: {
    type: 'box',
    motionType: PhysicsMotionType.STATIC,
    restitution: .3,
    friction: 1,
  },
  material: {
    type: 'basic',
    color: {
      type: "texture",
      uri: "/static/textures/KIPR_Surface_B.png"
    },
  },
};

const sciencePadTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'sciencepad',
  physics: {
    type: 'box',
    restitution: 1,
    friction: 1,
  },
  material: {
    type: 'basic',
    color: {
      type: "texture",
      uri: "/static/textures/science_pad2.png"
    },
  },
};

const basaltTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'basalt',
  physics: {
    type: 'mesh',
    restitution: .3,
    friction: 1,
    mass: Mass.grams(20),
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/textures/rocks/basalt_texture_m.png'
    },
  },
};

const anorthositeTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'anorthosite',
  physics: {
    type: 'mesh',
    restitution: .3,
    friction: 1,
    mass: Mass.grams(20),
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/textures/rocks/anorthosite_texture_m.png'
    },
  },
};

const brecciaTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'breccia',
  physics: {
    type: 'mesh',
    restitution: .3,
    friction: 1,
    mass: Mass.grams(20),
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/textures/rocks/breccia_texture_m.png'
    },
  },
};

const meteoriteTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'meteorite',
  physics: {
    type: 'mesh',
    restitution: .3,
    friction: 1,
    mass: Mass.grams(20),
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/textures/rocks/meteorite_texture_m.png'
    },
  },
};

const containerTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'container',
  physics: {
    type: 'mesh',
    restitution: .3,
    friction: 1,
    // mass: Mass.pounds(20),
  },
};
const botguyTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'botguy',
  physics: {
    type: 'mesh',
    restitution: .3,
    friction: 1,
    mass: Mass.grams(5),
  },
};
const solarpanelTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'solarpanel',
  physics: {
    type: 'mesh',
    restitution: .3,
    friction: 1,
    mass: Mass.pounds(.3),
  },
};

const walkwayTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'walkway',
  physics: {
    type: 'mesh',
    restitution: .3,
    friction: 1,
    mass: Mass.pounds(.3),
  },
};
const commstowerTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'commstower',
  physics: {
    type: 'mesh',
    restitution: .3,
    friction: 1,
    mass: Mass.pounds(.3),
  },
};

const habitatTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'habitat',
  physics: {
    type: 'mesh',
    restitution: .3,
    friction: 1,
    mass: Mass.pounds(.3),
  },
};

const habitatResearchTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'research_habitat',
  physics: {
    type: 'mesh',
    restitution: .3,
    friction: 1,
    mass: Mass.pounds(.3),
  },
};

const habitatControlTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'control_habitat',
  physics: {
    type: 'mesh',
    restitution: .3,
    friction: 1,
    mass: Mass.pounds(.3),
  },
};

const DRINK_PHYSICS: Node.Physics = {
  type: 'box',
  restitution: .1,
  friction: .5,
  mass: Mass.grams(5),
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
  colliderId: "collider-box-pom_big",
  type: 'box',
  restitution: .4,
  friction: 1,
  mass: Mass.grams(1),
  inertia: [1, 1, 1]
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
    restitution: .3,
    friction: .7,
    mass: Mass.grams(2),
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

export const preBuiltTemplates = Object.freeze<Dict<Node.TemplatedNode<Node>>>({
  'can': canTemplate,
  'circle': circleTemplate,
  'sciencepad': sciencePadTemplate,
  'lifescience': lifescienceTemplate,
  'radscience': radscienceTemplate,
  'noradscience': noradscienceTemplate,
  'ream': reamTemplate,
  'matA': matATemplate,
  'matB': matBTemplate,
  'basalt': basaltTemplate,
  'anorthosite': anorthositeTemplate,
  'breccia': brecciaTemplate,
  'meteorite': meteoriteTemplate,
  'container': containerTemplate,
  'botguy': botguyTemplate,
  'solarpanel': solarpanelTemplate,
  'walkway': walkwayTemplate,
  'commstower': commstowerTemplate,
  'habitat': habitatTemplate,
  'research_habitat': habitatResearchTemplate,
  'control_habitat': habitatControlTemplate,
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
});


export const preBuiltGeometries = Object.freeze<Dict<Geometry>>({
  'can': {
    type: 'cylinder',
    height: Distance.centimeters(11.15),
    radius: Distance.centimeters(3),
  },
  'circle': {
    type: 'cylinder',
    height: Distance.centimeters(0.1),
    radius: Distance.centimeters(3),
  },
  'lifescience': {
    type: 'cylinder',
    height: Distance.centimeters(7),
    radius: Distance.centimeters(3),
  },
  'radscience': {
    type: 'cylinder',
    height: Distance.centimeters(7),
    radius: Distance.centimeters(3),
  },
  'sciencepad': {
    type: 'box',
    size: {
      x: Distance.feet(1),
      y: Distance.centimeters(4),
      z: Distance.feet(1),
    }
  },
  'ream': {
    type: 'box',
    size: {
      x: Distance.centimeters(27.94),
      y: Distance.centimeters(5.08),
      z: Distance.centimeters(21.59),
    },
  },
  'mat': {
    type: 'box',
    size: {
      x: Distance.feet(2),
      y: Distance.centimeters(.1),
      z: Distance.feet(4),
    }
  },
  'basalt': {
    type: 'sphere',
    radius: Distance.centimeters(5),
    squash: 1,
    stretch: 1,
    noise: .5,
  },
  'anorthosite': {
    type: 'sphere',
    radius: Distance.centimeters(5),
    squash: .8,
    stretch: 1,
    noise: 1,
  },
  'breccia': {
    type: 'sphere',
    radius: Distance.centimeters(5),
    squash: 1,
    stretch: 1,
    noise: 1,
  },
  'meteorite': {
    type: 'sphere',
    radius: Distance.centimeters(5),
    squash: 1,
    stretch: 1,
    noise: 1,
  },
  'container': {
    type: 'file',
    uri: '/static/object_binaries/container_with_lid.glb'
  },
  'botguy': {
    type: 'file',
    uri: '/static/object_binaries/ogBotguy2.glb'
  },
  'solarpanel': {
    type: 'file',
    uri: '/static/object_binaries/basic_solar_panel.glb'
  },
  'walkway': {
    type: 'file',
    uri: '/static/object_binaries/basic_walkway.glb'
  },
  'commstower': {
    type: 'file',
    uri: '/static/object_binaries/comm_dish.glb'
  },
  'habitat': {
    type: 'file',
    uri: '/static/object_binaries/basic_hab.glb'
  },
  'research_habitat': {
    type: 'file',
    uri: '/static/object_binaries/manipulator_hab2.glb'
  },
  'control_habitat': {
    type: 'file',
    uri: '/static/object_binaries/com_hab.glb'
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
});