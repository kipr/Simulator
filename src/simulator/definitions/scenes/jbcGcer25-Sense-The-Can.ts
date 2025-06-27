import Scene from '../../../state/State/Scene';
import Script from '../../../state/State/Scene/Script';
import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import { Distance } from '../../../util';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const circles = [2, 4, 6, 9, 11];
const randomCircle = circles[Math.floor(Math.random() * circles.length)];

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot not started in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

const enterStartBox = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});


scene.addOnIntersectionListener('canRandom', (type, otherNodeId) => {
  console.log('Robot returned start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('canInStartBox', type === 'start');
    setNodeVisible('startBox', true);
  }
}, 'startBox');
`;

const uprightCan = `
// When a can is standing upright, the upright condition is met.

const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const yAngle = (nodeId) => 180 / Math.PI * -1 * Math.asin(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.Y, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.Y));

scene.addOnRenderListener(() => {
  const uprightRandom = yAngle('canRandom') > 5;
  scene.setChallengeEventValue('canRandomUpright', uprightRandom);
});
`;

export const Sense_The_Can: Scene = {
  ...baseScene,
  name: tr('GCER 2025: Sense the Can'),
  description: tr('GCER 2025 special event. A can is placed randomly in circle 2, 4, 6, 9 or 11. Find it and bring it back to the start box!'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    enterStartBox: Script.ecmaScript('Enter Start Box', enterStartBox),
    uprightCans: Script.ecmaScript('Upright Can', uprightCan),

  },
  geometry: {
    ...baseScene.geometry,
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.feet(2),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(30),
      },
    },
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
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: tr('Start Box'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(-3),
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
    'canRandom': createCanNode(randomCircle, undefined, true, true),
  },
};
