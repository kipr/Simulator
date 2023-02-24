import Scene from '../../../state/State/Scene';
import LocalizedString from '../../../util/LocalizedString';
import { Distance } from '../../../util';
import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import Script from '../../../state/State/Scene/Script';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const leftStartBox = `

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot left start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('leaveStartBox', type === 'end');
  }
  
}, 'startBox');
`;
export const JBC_22: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 22' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 22: Stackerz`,
  },
  scripts: {
    leftStartBox: Script.ecmaScript('Robot Left Start', leftStartBox),
  },
  geometry: {
    ...baseScene.geometry,

    mainSurface_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.meters(3.54),
      },
    },
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(1.77),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(30),
      },
    },
    canEnd_geom: {
      type: 'cylinder',
     
      radius: Distance.centimeters(3),
      height: Distance.centimeters(0.1),
    },
  },

  nodes: {
    ...baseScene.nodes,
    mainSurface: {
      type: 'object',
      geometryId: 'mainSurface_geom',
      name: { [LocalizedString.EN_US]: 'Mat Surface' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.75),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 0),
        },
      },
    },
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },
      
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(0),
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
   
    can5: createCanNode(5),
    can7: createCanNode(7),
    canEnd: {
      parentId: 'ground',
      type: 'object',
      geometryId: 'canEnd_geom',
      name: { [LocalizedString.EN_US]: 'Bottom or Top of a can' },
     
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(0),
          z: Distance.centimeters(0),
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
  
  },
};
