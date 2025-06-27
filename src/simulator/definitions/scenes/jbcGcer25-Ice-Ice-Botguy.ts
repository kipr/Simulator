import Scene from "../../../state/State/Scene";
import { ReferenceFramewUnits, RotationwUnits } from "../../../util/math/unitMath";
import { Distance } from "../../../util";
import { createBaseSceneSurfaceA, canPositions, } from './jbcBase';

import tr from '@i18n';
import { PhysicsMotionType } from "@babylonjs/core";
import Script from "../../../state/State/Scene/Script";

const baseScene = createBaseSceneSurfaceA();

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot not in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

const inStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot started in start box!', type, otherNodeId, scene.programStatus);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('inStartBox', true);
  }
}, 'startBox');
`;

const touchingLine = `
// If the robot wheels touch Line B, it fails the challenge

const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot touching line!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('robotTouchingLine', type === 'start');
    setNodeVisible('lineB', true);
  }
}, 'lineB');
`;

const reachedEnd = `
// If the robot reaches the end, it completes the challenge

const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot reached end!', type, otherNodeId);
  const visible = type === 'start';
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('reachedEnd', visible);
    setNodeVisible('endBox', visible);
  }
}, 'endBox');
`;

const offMat = `
// If the robot leaves the mat, it fails the challenge

const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot off mat!', type, otherNodeId);
  const visible = type === 'start';
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('offMat', visible);
    setNodeVisible('endOfMat', visible);
  }
}, 'endOfMat');
`;

const POMS_BLUE = {};
const POM_COLLIDER_SCRIPTS = {};
for (const [i, pos] of canPositions.entries()) {
  const p = {
    position: pos,
    scale: { x: 100, y: 100, z: 100 },
  };
  POM_COLLIDER_SCRIPTS[`pom_blue${i}_collision`] = Script.ecmaScript(`Pom ${i+1} Collided`, `
scene.addOnIntersectionListener('pom_blue${i}', (type, otherNodeId) => {
  // console.log('Robot off mat!', type, otherNodeId);
  // scene.setChallengeEventValue('offMat', visible);
  console.log('pom_blue${i} collided');
  setNodeVisible('endOfMat', visible);
}, 'botguy');
`);
  POMS_BLUE[`pom_blue${i}`] = {
    type: 'from-bb-template',
    name: tr(`Blue pom #${i+1}`),
    templateId: 'pom_blue',
    visible: true,
    editable: true,
    startingOrigin: p,
    origin: p,
  };
}

const BOTGUY_ORIGIN = {
  position: {
    x: Distance.centimeters(22.7),
    y: Distance.centimeters(-1),
    z: Distance.centimeters(-7),
  },
  scale: { x: 50, y: 50, z: 50 },
};

export const Ice_Ice_Botguy: Scene = {
  ...baseScene,
  name: tr('GCER 2025: Ice Ice Botguy'),
  description: tr('GCER 2025 special event. Botguy is overheating! Collect the ice and dump it on Botguy to cool him off!'),
  scripts: {
    ...POM_COLLIDER_SCRIPTS,
  },
  nodes: {
    ...baseScene.nodes,
    ...POMS_BLUE,
    'botguy': {
    type: 'object',
    name: tr('Botguy'),
    geometryId: 'botguy_gamepiece',
    visible: true,
    editable: true,
    physics: {
      type: 'mesh',
      restitution: .1,
      friction: .7,
      motionType: PhysicsMotionType.STATIC,
    },
    startingOrigin: BOTGUY_ORIGIN,
    origin: BOTGUY_ORIGIN,
    },
  }
};
