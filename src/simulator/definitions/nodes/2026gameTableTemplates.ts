import Dict from "../../../util/objectOps/Dict";
import Geometry from "../../../state/State/Scene/Geometry";
import Node from "../../../state/State/Scene/Node";
import { Mass } from "../../../util";
import { PhysicsMotionType } from "@babylonjs/core";

// TODO: Consider deep-freezing all of these objects

const gameTable2026Template: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'game_table_2026',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.STATIC,
    restitution: .2,
    friction: 1,
  },
};
const basketTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'basket',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.DYNAMIC,
    mass: Mass.grams(30),
    restitution: 0.2,
    friction: 2
  }
};
const CUBEPHYSICS: Node.Physics = {
  type: 'box',
  motionType: PhysicsMotionType.DYNAMIC,
  mass: Mass.grams(5),
  restitution: 0.4,
  friction: 4
};
const cubeBrown4inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cube_brown_4in',
  physics: CUBEPHYSICS
};
const cubeGreen2inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cube_green_2in',
  physics: CUBEPHYSICS
};
const cubeGreen4inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cube_green_4in',
  physics: CUBEPHYSICS
};
const cubeRed2inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cube_red_2in',
  physics: CUBEPHYSICS
};
const cubeRed4inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cube_red_4in',
  physics: CUBEPHYSICS
};
const cubeYellow2inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cube_yellow_2in',
  physics: CUBEPHYSICS
};
const palletTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pallet',
  physics: CUBEPHYSICS
};
const pomBlue2inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pom_blue_2in',
  physics: {
    type: 'sphere',
    motionType: PhysicsMotionType.DYNAMIC,
    mass: Mass.grams(5),
    restitution: 0.2,
    friction: 5
  }
};
const trafficConeTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'traffic_cone',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.DYNAMIC,
    mass: Mass.grams(10),
    restitution: 0.2,
    friction: 5
  }
};

export const BB2026Templates = Object.freeze<Dict<Node.TemplatedNode<Node>>>({
  'game_table_2026': gameTable2026Template,
  'basket': basketTemplate,
  'cubeBrown4in': cubeBrown4inTemplate,
  'cubeGreen2in': cubeGreen2inTemplate,
  'cubeGreen4in': cubeGreen4inTemplate,
  'cubeRed2in': cubeRed2inTemplate,
  'cubeRed4in': cubeRed4inTemplate,
  'cubeYellow2in': cubeYellow2inTemplate,
  'pallet': palletTemplate,
  'pomBlue2in': pomBlue2inTemplate,
  'trafficCone': trafficConeTemplate
});


export const BB2026Geometries = Object.freeze<Dict<Geometry>>({
  'game_table_2026': {
    type: 'file',
    uri: '/static/object_binaries/2026_Fall_Table.glb',
  },
  'basket': {
    type: 'file',
    uri: '/static/object_binaries/Basket.glb'
  },
  'cube_brown_4in': {
    type: 'file',
    uri: '/static/object_binaries/Cube_Brown_4in.glb'
  },
  'cube_green_2in': {
    type: 'file',
    uri: '/static/object_binaries/Cube_Green_2in.glb'
  },
  'cube_green_4in': {
    type: 'file',
    uri: '/static/object_binaries/Cube_Green_4in.glb'
  },
  'cube_red_2in': {
    type: 'file',
    uri: '/static/object_binaries/Cube_Red_2in.glb'
  },
  'cube_red_4in': {
    type: 'file',
    uri: '/static/object_binaries/Cube_Red_4in.glb'
  },
  'cube_yellow_2in': {
    type: 'file',
    uri: '/static/object_binaries/Cube_Yellow_2in.glb'
  },
  'pallet': {
    type: 'file',
    uri: '/static/object_binaries/pallet.glb'
  },
  'pom_blue_2in': {
    type: 'file',
    uri: '/static/object_binaries/Pom_Blue_2in.glb'
  },
  'traffic_cone': {
    type: 'file',
    uri: '/static/object_binaries/Traffic_Cone.glb'
  },
});
