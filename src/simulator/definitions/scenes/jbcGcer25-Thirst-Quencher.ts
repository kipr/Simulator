import Scene from '../../../state/State/Scene';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA, canPositions } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import { Distance } from '../../../util';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const circles = [3, 8, 10];
const cups = ['jbc_cup_blue', 'jbc_cup_pink', 'jbc_cup_green'];

const CUPS = {};
const CUP_SCRIPTS = {};
for (const [i, n] of circles.entries()) {
  CUP_SCRIPTS[`cup${i}_startbox`] = Script.ecmaScript(`Cup #${n + 1} in Start Box`, `
scene.addOnIntersectionListener('cup${i}', (type, otherNodeId) => {
  // scene.setChallengeEventValue('offMat', visible);
  console.log('cup${i} in start box');
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('cup${i}_startbox', type === 'start');
  }
}, 'startBox');
`);

  const p = {
    position: canPositions[n],
  };
  CUPS[`cup${i}`] = {
    type: 'from-jbc-template',
    name: tr(`Cup #${n + 1}`),
    templateId: cups[Math.floor(Math.random() * cups.length)],
    visible: true,
    editable: true,
    startingOrigin: p,
    origin: p,
  };
}

const notInStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot not started in start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('notInStartBox', type === 'start');
  }
}, 'notStartBox');
`;

export const Thirst_Quencher: Scene = {
  ...baseScene,
  name: tr('GCER 2025: Thirst Quencher'),
  description: tr('GCER 2025 special event. Dont let the summer heat get you down. Bring the cups back to the start box!'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    ...CUP_SCRIPTS,
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
    ...CUPS,
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
  },
};
