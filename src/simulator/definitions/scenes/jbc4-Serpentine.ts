import Scene from '../../../state/State/Scene';
import LocalizedString from '../../../util/LocalizedString';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, createCircleNode } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import { Distance } from '../../../util';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot not started in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

const touchedCircle = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
  });

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
    notStartBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(10),
        z: Distance.meters(2.13),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    notStartBox: {
      type: 'object',
      geometryId: 'notStartBox_geom',
      name: tr('Not Start Box'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-1.9),
          z: Distance.meters(1.208),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 0, 0),
        },
      },
    },
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
