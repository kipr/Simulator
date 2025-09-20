import Scene from '../../../state/State/Scene';
import Script from '../../../state/State/Scene/Script';
import { createCanNode, createBaseSceneSurfaceA, createCircleNode } from './jbcBase';
import { setNodeVisible, matAStartGeoms, matAStartNodes, notInStartBox, nodeUpright } from './jbcCommonComponents';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const circleIntersects = `
${setNodeVisible}
// When the can is intersecting circle9, the circle glows
scene.addOnIntersectionListener('can9', (type, otherNodeId) => {
  // console.log('Can 9 on circle!', type, otherNodeId);
  scene.setChallengeEventValue('can9Intersects', type === 'start');
}, 'circle9');
`;

const enterStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot returned start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('returnStartBox', type === 'start');
  }
}, 'startBox');
`;

const robotTouches = `
scene.addOnCollisionListener('can9', (otherNodeId) => {
  // console.log('Robot touched Can 9!');
  scene.setChallengeEventValue('can9Touched', true);
}, 'robot');
`;

const uprightCans = `
${nodeUpright}
scene.addOnRenderListener(() => {
  const upright9 = nodeUpright('can9');
  scene.setChallengeEventValue('can9Upright', upright9);
});
`;

export const JBC_1: Scene = {
  ...baseScene,
  name: tr('JBC 1'),
  description: tr('Junior Botball Challenge 1: Tag, You\'re It!'),
  scripts: {
    'notInStartBox': Script.ecmaScript('Not In Start Box', notInStartBox),
    'circleIntersects': Script.ecmaScript('Circle Intersects', circleIntersects),
    'uprightCans': Script.ecmaScript('Upright Cans', uprightCans),
    'robotTouches': Script.ecmaScript('Robot Touches', robotTouches),
    'enterStartBox': Script.ecmaScript('Robot Reentered Start', enterStartBox),
  },
  geometry: {
    ...baseScene.geometry,
    ...matAStartGeoms,
  },
  nodes: {
    ...baseScene.nodes,
    ...matAStartNodes,
    can9: createCanNode(9),
    circle9: createCircleNode(9),
  }
};
