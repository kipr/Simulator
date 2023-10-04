import Dict from "../Dict";
import { Vector2 } from "../math";
import { Color } from "../state/State/Scene/Color";
import Geometry from "../state/State/Scene/Geometry";
import Node from "../state/State/Scene/Node";
import { Distance, Mass } from "../util";

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
  faceUvs: [Vector2.ZERO, Vector2.ZERO, Vector2.create(1, 0), Vector2.create(0, 1), Vector2.ZERO, Vector2.ZERO],
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
  faceUvs: [Vector2.ZERO, Vector2.ZERO, Vector2.create(1, 0), Vector2.create(0, 1), Vector2.ZERO, Vector2.ZERO],
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
  faceUvs: [Vector2.ZERO, Vector2.ZERO, Vector2.create(1, 0), Vector2.create(0, 1), Vector2.ZERO, Vector2.ZERO],
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
  faceUvs: [Vector2.ZERO, Vector2.ZERO, Vector2.create(1, 0), Vector2.create(0, 1), Vector2.ZERO, Vector2.ZERO],
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

export const preBuiltTemplates = Object.freeze<Dict<Node.TemplatedNode<Node>>>({
  'can': canTemplate,
  'sciencepad': sciencePadTemplate,
  'lifescience': lifescienceTemplate,
  'radscience': radscienceTemplate,
  'noradscience': noradscienceTemplate,
  'ream': reamTemplate,
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
});


export const preBuiltGeometries = Object.freeze<Dict<Geometry>>({
  'can': {
    type: 'cylinder',
    height: Distance.centimeters(11.15),
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
    uri: '/static/object_binaries/solar_panel2.glb'
  },
  'walkway': {
    type: 'file',
    uri: '/static/object_binaries/new_walkway.glb'
  },
  'commstower': {
    type: 'file',
    uri: '/static/object_binaries/comm_dish.glb'
  },
  'habitat': {
    type: 'file',
    uri: '/static/object_binaries/hab_living.glb'
  },
  'research_habitat': {
    type: 'file',
    uri: '/static/object_binaries/hab_research.glb'
  },
  'control_habitat': {
    type: 'file',
    uri: '/static/object_binaries/hab_comms.glb'
  },
});