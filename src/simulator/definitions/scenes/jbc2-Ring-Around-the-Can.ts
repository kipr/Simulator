import Scene from '../../../state/State/Scene';
import Script from '../../../state/State/Scene/Script';
import { createCanNode, createBaseSceneSurfaceA, createCircleNode } from './jbcBase';
import { setNodeVisible, getNodeYAngle, matAStartGeoms, matAStartNodes, notInStartBox } from './jbcCommonComponents';
import { Color } from '../../../state/State/Scene/Color';
import { Distance } from '../../../util';
import { RotationwUnits } from '../../../util/math/unitMath';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const circleIntersects = `
${setNodeVisible}
// When the can (can6) is intersecting circle6, the circle glows

scene.addOnIntersectionListener('can6', (type, otherNodeId) => {
  // console.log('Can 6 placed!', type, otherNodeId);
  const visible = type === 'start';
  scene.setChallengeEventValue('can6Intersects', visible);
  setNodeVisible('circle6', visible);
}, 'circle6');

`;

const enterStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot returned start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('returnStartBox', type === 'start');
  }
}, 'startBox');
`;

const passedSide = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  switch(otherNodeId){
    case 'rightSideCan':
      // console.log('Robot passed the right side of the can!', type, otherNodeId);
      if(scene.programStatus === 'running'){
        scene.setChallengeEventValue('rightSide', type === 'start');
      }
      break;
    case 'topSideCan':
      // console.log('Robot passed the top side of the can!', type, otherNodeId);
      if(scene.programStatus === 'running'){
        scene.setChallengeEventValue('topSide', type === 'start');
      }
      break;
    case 'leftSideCan':
      // console.log('Robot passed the left side of the can!', type, otherNodeId);
      if(scene.programStatus === 'running'){
        scene.setChallengeEventValue('leftSide', type === 'start');
      }
      break;
  }
}, ['rightSideCan', 'topSideCan', 'leftSideCan']);

`;

const uprightCans = `
${getNodeYAngle}
scene.addOnRenderListener(() => {
  const upright6 = yAngle('can6') > 5;
  scene.setChallengeEventValue('can6Upright', upright6);
});
`;

export const JBC_2: Scene = {
  ...baseScene,
  name: tr('JBC 2'),
  description: tr('Junior Botball Challenge 2: Ring Around the Can'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    circleIntersects: Script.ecmaScript('Circle Intersects', circleIntersects),
    uprightCans: Script.ecmaScript('Upright Cans', uprightCans),
    passedSide: Script.ecmaScript('Passed Side', passedSide),
    enterStartBox: Script.ecmaScript('Robot Reentered Start', enterStartBox),
  },
  geometry: {
    ...baseScene.geometry,
    ...matAStartGeoms,
    sideCan_geom: {
      type: 'box',
      size: {
        x: Distance.meters(1.77),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(1),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    ...matAStartNodes,
    rightSideCan: {
      type: 'object',
      geometryId: 'sideCan_geom',
      name: tr('Right Side Can'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-88.5),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(56.9),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    topSideCan: {
      type: 'object',
      geometryId: 'sideCan_geom',
      name: tr('Top Side Can'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(145.7),
        },
        orientation: RotationwUnits.eulerDegrees(0, 90, 0)
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    leftSideCan: {
      type: 'object',
      geometryId: 'sideCan_geom',
      name: tr('Left Side Can'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(88.5),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(56.9),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    can6: createCanNode(6),
    circle6: createCircleNode(6),
  },
};
