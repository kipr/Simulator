import Scene from '../../../state/State/Scene';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, createCircleNode } from './jbcBase';
import { matAStartGeoms, matAStartNodes, notInStartBox, setNodeVisible } from './jbcCommonComponents';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const oddNumberIntersects = `
${setNodeVisible}

let circles = new Set(['circle1', 'circle3', 'circle5', 'circle7', 'circle9', 'circle11']);
const evenCircles = new Set(['circle2', 'circle4', 'circle6', 'circle8', 'circle10', 'circle12']);

let circlesMap = new Map([
  ['circle1', false],
  ['circle3', false],
  ['circle5', false],
  ['circle7', false],
  ['circle9', false],
  ['circle11', false],
]);

const cb = (type, otherNodeId) => {
  console.log('Robot intersects!', type, otherNodeId);
  if (evenCircles.has(otherNodeId)) {
    scene.setChallengeEventValue('touchedEvenCircle', true);
    return;
  }
  else {
    switch (otherNodeId) {
      case 'circle1':
        circlesMap.set(otherNodeId, true);
        scene.setChallengeEventValue('circle1Touched', true);
        setNodeVisible(otherNodeId, true);
        circles.delete('circle1');
        break;
      case 'circle3':
        if (circlesMap.get('circle1')) {
          circlesMap.set(otherNodeId, true);
          scene.setChallengeEventValue('circle3Touched', true);
          setNodeVisible(otherNodeId, true);
          circles.delete(otherNodeId);
          break;
        }
        else {
          scene.setChallengeEventValue('wrongOrder', true);
          break;
        }
      case 'circle5':
        if (circlesMap.get('circle3')) {
          circlesMap.set(otherNodeId, true);
          scene.setChallengeEventValue('circle5Touched', true);
          setNodeVisible(otherNodeId, true);
          circles.delete(otherNodeId);
          break;
        }
        else {
          scene.setChallengeEventValue('wrongOrder', true);
          break;
        }
      case 'circle7':
        if (circlesMap.get('circle5')) {
          circlesMap.set(otherNodeId, true);
          scene.setChallengeEventValue('circle7Touched', true);
          setNodeVisible(otherNodeId, true);
          circles.delete(otherNodeId);
          break;
        }
        else {
          scene.setChallengeEventValue('wrongOrder', true);
          break;
        }
      case 'circle9':
        if (circlesMap.get('circle7')) {
          circlesMap.set(otherNodeId, true);
          scene.setChallengeEventValue('circle9Touched', true);
          setNodeVisible(otherNodeId, true);
          circles.delete(otherNodeId);
          break;
        }
        else {
          scene.setChallengeEventValue('wrongOrder', true);
          break;
        }
      case 'circle11':
        if (circlesMap.get('circle9')) {
          circlesMap.set(otherNodeId, true);
          scene.setChallengeEventValue('circle11Touched', true);
          setNodeVisible(otherNodeId, true);
          circles.delete(otherNodeId);
          break;
        }
        else {
          scene.setChallengeEventValue('wrongOrder', true);
          break;
        }
      default:
        console.warn('Unknown circle: ', otherNodeId);
        break;
    }
  }
}

// When a wheel is touching a circle with an odd number, the circle glows
scene.addOnIntersectionListener('robot', cb, new Set([...circles, ...evenCircles]));
`;

export const JBC_5: Scene = {
  ...baseScene,
  name: tr('JBC 5'),
  description: tr('Junior Botball Challenge 5: Odd Numbers'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not In Start Box', notInStartBox),
    oddNumberIntersects: Script.ecmaScript('Odd Number Intersects', oddNumberIntersects),
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
    circle9: createCircleNode(9),
    circle10: createCircleNode(10),
    circle11: createCircleNode(11),
    circle12: createCircleNode(12),
  },
};
