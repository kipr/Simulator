import Dict from "../../../util/objectOps/Dict";
import Geometry from "../../../state/State/Scene/Geometry";
import Node from "../../../state/State/Scene/Node";
import { Mass } from "../../../util";
import { PhysicsMotionType } from "@babylonjs/core";

// TODO: Consider deep-freezing all of these objects

const gameTable2026Template: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'gameTable2026',
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
  geometryId: 'cubeBrown4In',
  physics: CUBEPHYSICS
};
const cubeGreen2inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cubeGreen2In',
  physics: CUBEPHYSICS
};
const cubeGreen4inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cubeGreen4In',
  physics: CUBEPHYSICS
};
const cubeRed2inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cubeRed2In',
  physics: CUBEPHYSICS
};
const cubeRed4inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cubeRed4In',
  physics: CUBEPHYSICS
};
const cubeYellow2inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'cubeYellow2In',
  physics: CUBEPHYSICS
};
const palletTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pallet',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.DYNAMIC,
    mass: Mass.grams(5),
    restitution: 0.2,
    friction: 4
  }
};
const pomBlue2inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pomBlue2In',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.DYNAMIC,
    mass: Mass.grams(10),
    restitution: 0.2,
    friction: 5
  }
};
const trafficConeTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'trafficCone',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.DYNAMIC,
    mass: Mass.grams(10),
    restitution: 0.2,
    friction: 5
  }
};
const pcv2inTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pvc2In',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.DYNAMIC,
    mass: Mass.grams(7.5),
    restitution: 0.2,
    friction: 3.75
  }
};

export const BB2026Templates = Object.freeze<Dict<Node.TemplatedNode<Node>>>({
  'gameTable2026': gameTable2026Template,
  'basket': basketTemplate,
  'cubeBrown4In': cubeBrown4inTemplate,
  'cubeGreen2In': cubeGreen2inTemplate,
  'cubeGreen4In': cubeGreen4inTemplate,
  'cubeRed2In': cubeRed2inTemplate,
  'cubeRed4In': cubeRed4inTemplate,
  'cubeYellow2In': cubeYellow2inTemplate,
  'pallet': palletTemplate,
  'pomBlue2In': pomBlue2inTemplate,
  'trafficCone': trafficConeTemplate,
  'pcv2In': pcv2inTemplate
});


export const BB2026Geometries = Object.freeze<Dict<Geometry>>({
  'gameTable2026': {
    type: 'file',
    uri: '/static/object_binaries/2026_Fall_Table.glb',
  },
  'basket': {
    type: 'file',
    uri: '/static/object_binaries/Basket.glb'
  },
  'cubeBrown4In': {
    type: 'file',
    uri: '/static/object_binaries/Cube_Brown_4in.glb'
  },
  'cubeGreen2In': {
    type: 'file',
    uri: '/static/object_binaries/Cube_Green_2in.glb'
  },
  'cubeGreen4In': {
    type: 'file',
    uri: '/static/object_binaries/Cube_Green_4in.glb'
  },
  'cubeRed2In': {
    type: 'file',
    uri: '/static/object_binaries/Cube_Red_2in.glb'
  },
  'cubeRed4In': {
    type: 'file',
    uri: '/static/object_binaries/Cube_Red_4in.glb'
  },
  'cubeYellow2In': {
    type: 'file',
    uri: '/static/object_binaries/Cube_Yellow_2in.glb'
  },
  'pallet': {
    type: 'file',
    uri: '/static/object_binaries/Pallet.glb'
  },
  'pomBlue2In': {
    type: 'file',
    uri: '/static/object_binaries/Pom_Blue_2in.glb'
  },
  'trafficCone': {
    type: 'file',
    uri: '/static/object_binaries/Traffic_Cone.glb'
  },
  'pvc2In': {
    type: 'file',
    uri: '/static/object_binaries/PVC2in.glb'
  }
});
