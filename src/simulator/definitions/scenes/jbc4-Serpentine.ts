import Scene from '../../../state/State/Scene';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, createCircleNode } from './jbcBase';
import { notInStartBox, setNodeVisible, matAStartGeoms, matAStartNodes } from './jbcCommonComponents';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const touchedCircle = `
${setNodeVisible}

let circles = ['circle1','circle2','circle3','circle4','circle5','circle6','circle7','circle8'];

let prevCircle = 0;
let currCircle = 1;

scene.addOnRenderListener(() => {
  if(scene.programStatus !== 'running') {
    prevCircle = 0;
    currCircle = 1;
  }
});

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  if(scene.programStatus !== 'running') return;
  const circleNumber = otherNodeId.charAt(otherNodeId.length-1);
  if(type === 'start' && (currCircle == circleNumber)){
    setNodeVisible(otherNodeId, true);
    scene.setChallengeEventValue('touched' + circleNumber, true);
    prevCircle++;
    currCircle++;
  }
  if(type === 'start' && !(currCircle == circleNumber || prevCircle == circleNumber)){
    scene.setChallengeEventValue('wrongOrder', true);
  }
}, [...circles]);
`;
export const JBC_4: Scene = {
  ...baseScene,
  name: tr('JBC 4'),
  description: tr('Junior Botball Challenge 4: Serpentine'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    touchedCircle: Script.ecmaScript('Touched Circle', touchedCircle),
  },
  geometry: {
    ...baseScene.geometry,
    notStartBoxGeom: matAStartGeoms.notStartBoxGeom
  },
  nodes: {
    ...baseScene.nodes,
    notStartBox: matAStartNodes.notStartBox,
    circle1: createCircleNode(1),
    circle2: createCircleNode(2),
    circle3: createCircleNode(3),
    circle4: createCircleNode(4),
    circle5: createCircleNode(5),
    circle6: createCircleNode(6),
    circle7: createCircleNode(7),
    circle8: createCircleNode(8),
  },
};
