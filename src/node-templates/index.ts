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

const towerTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'tower',
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
      uri: '/static/textures/tower/tall_tower_texture.png'
    },
  },
  faceUvs: [Vector2.ZERO, Vector2.ZERO, Vector2.create(1, 0), Vector2.create(0, 1), Vector2.ZERO, Vector2.ZERO],
};

const reamTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'ream',
  physics: {
    type: 'box',
    restitution: .9,
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

const habTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'hab',
  physics: {
    type: 'mesh',
    restitution: .3,
    friction: 1,
    mass: Mass.pounds(.5),
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/textures/hab5.png'
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
    mass: Mass.pounds(.5),
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/textures/rocks/basalt_texture_w.png'
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
    mass: Mass.pounds(.5),
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/textures/rocks/anorthosite_texture_w.png'
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
    mass: Mass.pounds(.5),
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/textures/rocks/breccia_texture_w.png'
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
    mass: Mass.pounds(.5),
  },
  material: {
    type: 'basic',
    color: {
      type: 'texture',
      uri: '/static/textures/rocks/meteorite_texture_w.png'
    },
  },
};

const jbcMatATemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'jbc_mat_a',
  physics: {
    type: 'box',
    restitution: 0,
    friction: 1
  },
};

const jbcMatBTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'jbc_mat_b',
  physics: {
    type: 'box',
    restitution: 0,
    friction: 1
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
    mass: Mass.pounds(.3),
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
    type: 'box',
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

export const preBuiltTemplates = Object.freeze<Dict<Node.TemplatedNode<Node>>>({
  'can': canTemplate,
  'tower': towerTemplate,
  'lifescience': lifescienceTemplate,
  'radscience': radscienceTemplate,
  'noradscience': noradscienceTemplate,
  'hab': habTemplate,
  'ream': reamTemplate,
  'basalt': basaltTemplate,
  'anorthosite': anorthositeTemplate,
  'breccia': brecciaTemplate,
  'meteorite': meteoriteTemplate,
  'jbc_mat_a': jbcMatATemplate,
  'jbc_mat_b': jbcMatBTemplate,
  'container': containerTemplate,
  'botguy': botguyTemplate,
  'solarpanel': solarpanelTemplate,
  'walkway': walkwayTemplate,
  'commstower': commstowerTemplate,
  'habitat': habitatTemplate,
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
  'tower': {
    type: 'cylinder',
    height: Distance.centimeters(25),
    radius: Distance.centimeters(4),
  },
  'ream': {
    type: 'box',
    size: {
      x: Distance.centimeters(27.94),
      y: Distance.centimeters(5.08),
      z: Distance.centimeters(21.59),
    },
  },
  'hab': {
    type: 'sphere',
    radius: Distance.centimeters(15),
    squash: 1,
    stretch: 1,
    noise: 0,
  },
  'basalt': {
    type: 'sphere',
    radius: Distance.centimeters(3.5),
    squash: 1,
    stretch: 1,
    noise: .5,
  },
  'anorthosite': {
    type: 'sphere',
    radius: Distance.centimeters(3.5),
    squash: .8,
    stretch: 1,
    noise: 1,
  },
  'breccia': {
    type: 'sphere',
    radius: Distance.centimeters(3.5),
    squash: 1,
    stretch: 1,
    noise: 1,
  },
  'meteorite': {
    type: 'sphere',
    radius: Distance.centimeters(3.5),
    squash: 1,
    stretch: 1,
    noise: 1,
  },
  'jbc_mat_a': {
    type: 'file',
    uri: '/static/object_binaries/jbcMatA.glb'
  },
  'jbc_mat_b': {
    type: 'file',
    uri: '/static/object_binaries/jbcMatB.glb'
  },
  'container': {
    type: 'file',
    uri: '/static/object_binaries/box2.glb'
  },
  'botguy': {
    type: 'file',
    uri: '/static/object_binaries/botguy.glb'
  },
  'solarpanel': {
    type: 'file',
    uri: '/static/object_binaries/solar_test2.glb'
  },
  'walkway': {
    type: 'file',
    uri: '/static/object_binaries/walkway_test.glb'
  },
  'commstower': {
    type: 'file',
    uri: '/static/object_binaries/commstower2.glb'
  },
  'habitat': {
    type: 'file',
    uri: '/static/object_binaries/habitat.glb'
  },
});