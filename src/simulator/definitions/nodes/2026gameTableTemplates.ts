import Dict from "../../../util/objectOps/Dict";
import Geometry from "../../../state/State/Scene/Geometry";
import Node from "../../../state/State/Scene/Node";
import { Mass } from "../../../util";
import { PhysicsMotionType } from "@babylonjs/core";

// TODO: Consider deep-freezing all of these objects

const fallTable26Template: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'fallTable26',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.STATIC,
    restitution: .2,
    friction: 1,
  },
};
const springTable26Template: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'springTable26',
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
const slidingDoorTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'slidingDoor',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.DYNAMIC,
    mass: Mass.grams(11),
    restitution: 0.2,
    friction: 0.3
  }
};
const pvc2inBlueTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pvc2inBlue',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.DYNAMIC,
    mass: Mass.grams(11),
    restitution: 0.2,
    friction: 0.3
  }
};
const pvc2inPinkTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'pvc2inPink',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.DYNAMIC,
    mass: Mass.grams(11),
    restitution: 0.2,
    friction: 0.3
  }
};

export const BB2026Templates = Object.freeze<Dict<Node.TemplatedNode<Node>>>({
  'fallTable26': fallTable26Template,
  'springTable26': springTable26Template,
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
  'pcv2In': pcv2inTemplate,
  'slidingDoor': slidingDoorTemplate,
  'pvc2inBlue': pvc2inBlueTemplate,
  'pvc2inPink': pvc2inPinkTemplate
});


export const BB2026Geometries = Object.freeze<Dict<Geometry>>({
  'fallTable26': {
    type: 'file',
    uri: '/static/object_binaries/2026_Fall_Table.glb',
  },
  'springTable26': {
    type: 'file',
    uri: '/static/object_binaries/2026_Table.glb',
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
  },
  'slidingDoor': {
    type: 'file',
    uri: '/static/object_binaries/Sliding_Door.glb'
  },
  'pvc2inBlue': {
    type: 'file',
    uri: '/static/object_binaries/PVC2in_Blue.glb'
  },
  'pvc2inPink': {
    type: 'file',
    uri: '/static/object_binaries/PVC2in_Pink.glb'
  }
});
