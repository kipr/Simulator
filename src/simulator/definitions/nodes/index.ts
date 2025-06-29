import Dict from "../../../util/objectOps/Dict";
import { RawVector2 } from "../../../util/math/math";
import { Color } from "../../../state/State/Scene/Color";
import Geometry from "../../../state/State/Scene/Geometry";
import Node from "../../../state/State/Scene/Node";
import { Distance, Mass } from "../../../util";
import { PhysicsMotionType } from "@babylonjs/core";

import { BB2025Templates, BB2025Geometries } from "./2025gameTableTemplates";

// TODO: Consider deep-freezing all of these objects

const canTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'can',
  physics: {
    type: 'cylinder',
    mass: Mass.grams(5),
    friction: 0.7,
    restitution: 0.3,
    inertia: [1, 1, 1],
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

const JBC_CUP_PHYSICS: Node.Physics = {
  type: 'none',
  restitution: .20,
  friction: 1,
  mass: Mass.grams(300),
  inertia: [50, 50, 50],
};
const jbcCupBlueTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'jbc_cup_blue',
  physics: JBC_CUP_PHYSICS
};
const jbcCupGreenTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'jbc_cup_green',
  physics: JBC_CUP_PHYSICS
};
const jbcCupPinkTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'jbc_cup_pink',
  physics: JBC_CUP_PHYSICS
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
  'jbc_cup_blue': jbcCupBlueTemplate,
  'jbc_cup_green': jbcCupGreenTemplate,
  'jbc_cup_pink': jbcCupPinkTemplate,
  ...BB2025Templates,
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
  'jbc_cup_blue': {
    type: 'file',
    uri: '/static/object_binaries/jbc_cup_blue.glb'
  },
  'jbc_cup_green': {
    type: 'file',
    uri: '/static/object_binaries/jbc_cup_green.glb'
  },
  'jbc_cup_pink': {
    type: 'file',
    uri: '/static/object_binaries/jbc_cup_pink.glb'
  },
  ...BB2025Geometries,
});
