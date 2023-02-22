import Scene from '../../../state/State/Scene';
import LocalizedString from '../../../util/LocalizedString';
import { Distance } from '../../../util';
import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import Script from '../../../state/State/Scene/Script';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const footTallBox = `

scene.addOnIntersectionListener('can9', (type, otherNodeId) => {
  console.log('Bottom of can 9 is at the foot tall mark!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('footTallMark', type === 'end');
  }
  
}, 'footTall');
`;

export const JBC_21: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 21' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 21: Foot Tall`,
  },
  scripts: {
    footTallBox: Script.ecmaScript('Foot Tall Cutoff', footTallBox),
  },
  geometry: {
    ...baseScene.geometry,
    footTall_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.meters(3.54),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    footTall: {
      type: 'object',
      geometryId: 'footTall_geom',
      name: { [LocalizedString.EN_US]: 'Foot Tall Cutoff' },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(0), //circle 6
          y: Distance.inches(11),
          z: Distance.centimeters(57.2),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    can9: {
      ...createCanNode(9),
      scriptIds: ["footTallBox"],

    },
  },
};
