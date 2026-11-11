import Dict from "../../../util/objectOps/Dict";
import Geometry from "../../../state/State/Scene/Geometry";
import Node from "../../../state/State/Scene/Node";
import { Mass } from "../../../util";
import { PhysicsMotionType } from "@babylonjs/core";
import { MODELS } from '../models';

// TODO: Consider deep-freezing all of these objects
const botballExplorerTable26Template: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'botballExplorerTable26',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.STATIC,
    restitution: .2,
    friction: 1,
  },
};
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
    friction: .3
  }
};
const CUBEPHYSICS: Node.Physics = {
  type: 'box',
  motionType: PhysicsMotionType.DYNAMIC,
  mass: Mass.grams(2),
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
    type: 'box',
    motionType: PhysicsMotionType.DYNAMIC,
    mass: Mass.grams(1),
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
    type: 'cylinder',
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
    type: 'cylinder',
    motionType: PhysicsMotionType.DYNAMIC,
    mass: Mass.grams(11),
    restitution: 0.2,
    friction: 0.3
  }
};
const dropper26Template: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'dropper',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.STATIC,
    mass: Mass.grams(11),
    restitution: 0.3,
    friction: 0.2
  }
};
const gateTemplate: Node.TemplatedNode<Node.Obj> = {
  type: 'object',
  geometryId: 'gate',
  physics: {
    type: 'mesh',
    motionType: PhysicsMotionType.STATIC,
    mass: Mass.grams(11),
    restitution: 0,
    friction: 1
  }
};

export const BB2026Templates = Object.freeze<Dict<Node.TemplatedNode<Node>>>({
  'botballExplorerTable26': botballExplorerTable26Template,
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
  'pvc2inPink': pvc2inPinkTemplate,
  'dropper26': dropper26Template,
  'gate': gateTemplate
});


export const BB2026Geometries = Object.freeze<Dict<Geometry>>({
  'botballExplorerTable26': {
    type: 'file',
    uri: MODELS.games[2026].explorerTable,
  },
  'fallTable26': {
    type: 'file',
    uri: MODELS.games[2026].fallTable,
  },
  'springTable26': {
    type: 'file',
    uri: MODELS.games[2026].springTable,
  },
  'basket': {
    type: 'file',
    uri: MODELS.games[2026].basket
  },
  'cubeBrown4In': {
    type: 'file',
    uri: MODELS.games[2026].cube.brown4in
  },
  'cubeGreen2In': {
    type: 'file',
    uri: MODELS.games[2026].cube.green2in
  },
  'cubeGreen4In': {
    type: 'file',
    uri: MODELS.games[2026].cube.green4in
  },
  'cubeRed2In': {
    type: 'file',
    uri: MODELS.games[2026].cube.red2in
  },
  'cubeRed4In': {
    type: 'file',
    uri: MODELS.games[2026].cube.red4in
  },
  'cubeYellow2In': {
    type: 'file',
    uri: MODELS.games[2026].cube.yellow2in
  },
  'pallet': {
    type: 'file',
    uri: MODELS.games[2026].pallet
  },
  'pomBlue2In': {
    type: 'file',
    uri: MODELS.games[2026].pomBlue
  },
  'trafficCone': {
    type: 'file',
    uri: MODELS.games[2026].trafficCone
  },
  'pvc2In': {
    type: 'file',
    uri: MODELS.games[2026].pvc.white
  },
  'slidingDoor': {
    type: 'file',
    uri: MODELS.games[2026].slidingDoor
  },
  'pvc2inBlue': {
    type: 'file',
    uri: MODELS.games[2026].pvc.blue
  },
  'pvc2inPink': {
    type: 'file',
    uri: MODELS.games[2026].pvc.pink
  },
  'dropper': {
    type: 'file',
    uri: MODELS.games[2026].dropper
  },
  'gate': {
    type: 'file',
    uri: MODELS.games[2026].gate
  },
});
