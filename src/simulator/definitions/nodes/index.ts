import Dict from "../../../util/objectOps/Dict";
import { RawVector2 } from "../../../util/math/math";
import { Color } from "../../../state/State/Scene/Color";
import Geometry from "../../../state/State/Scene/Geometry";
import Node from "../../../state/State/Scene/Node";
import { Distance, Mass } from "../../../util";
import { POM_YELLOW } from "../robots";

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

const pomBlueTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pom_blue',
  physics: {
    type: 'box',
    restitution: .4,
    friction: .7,
    mass: Mass.grams(1),
    // inertia: [1, 1, 1],
  },
};
const pomRedTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pom_red',
  physics: {
    type: 'box',
    restitution: .4,
    friction: .7,
    mass: Mass.grams(1),
    // inertia: [1, 1, 1],
  },
};
const pomOrangeTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pom_orange',
  physics: {
    type: 'box',
    restitution: .4,
    friction: .7,
    mass: Mass.grams(1),
    // inertia: [1, 1, 1],
  },
};
const pomYellowTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pom_yellow',
  physics: {
    type: 'box',
    restitution: .4,
    friction: .7,
    mass: Mass.grams(1),
    // inertia: [1, 1, 1],
  },
};
const drinkBlueTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'drink_blue',
  physics: {
    type: 'box',
    restitution: .1,
    friction: 5,
    mass: Mass.grams(1)
  },
};
const drinkGreenTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'drink_green',
  physics: {
    type: 'box',
    restitution: .9,
    friction: 5,
    mass: Mass.grams(1)
  },
};
const drinkPinkTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'drink_pink',
  physics: {
    type: 'box',
    restitution: .1,
    friction: 5,
    mass: Mass.grams(1)
  },
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
  'pom_blue': pomBlueTemplate,
  'pom_red': pomRedTemplate,
  'pom_orange': pomOrangeTemplate,
  'pom_yellow': pomYellowTemplate,
  'drink_green': drinkGreenTemplate,
  'drink_pink': drinkPinkTemplate,
  'drink_blue': drinkBlueTemplate,
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
  'pom_blue': {
    type: 'file',
    uri: '/static/object_binaries/pom_blue.glb'
  },
  'pom_red': {
    type: 'file',
    uri: '/static/object_binaries/pom_red.glb'
  },
  'pom_orange': {
    type: 'file',
    uri: '/static/object_binaries/pom_orange.glb'
  },
  'pom_yellow': {
    type: 'file',
    uri: '/static/object_binaries/pom_yellow.glb'
  },
  'drink_blue': {
    type: 'file',
    uri: '/static/object_binaries/drink_blue.glb'
  },
  'drink_green': {
    type: 'file',
    uri: '/static/object_binaries/drink_green.glb'
  },
  'drink_pink': {
    type: 'file',
    uri: '/static/object_binaries/drink_pink.glb'
  },
});