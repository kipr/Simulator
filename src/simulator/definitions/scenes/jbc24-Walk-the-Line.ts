import Scene from '../../../state/State/Scene';
import { Distance } from '../../../util';
import LocalizedString from '../../../util/LocalizedString';
import { ReferenceFramewUnits } from '../../../util/math/unitMath';
import { createCanNode, createBaseSceneSurfaceB } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import Script from '../../../state/State/Scene/Script';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceB();

const lineFollow = `
let count = 0;

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  //Reset counter if robot in start box
  if(otherNodeId == 'startBox' && type === 'start'){
    count = 0;
  }
  //1st checkpoint
  if(otherNodeId == 'n1' && type === 'start' && count == 0){
    count = 1;
    // console.log('Robot passed checkpoint 1');
  }
  //2nd checkpoint
  else if (otherNodeId == 'n2' && type === 'start' && count == 1){
    count = 2;
    // console.log('Robot passed checkpoint 2 after checkpoint 1');
  }
  //3rd checkpoint
  else if(otherNodeId == 'n3' && type === 'start'&& count == 2){
    count = 3;
    // console.log('Robot passed checkpoint 3 after checkpoint 2');
  }
  //Finish line after all other checkpoints
  else if(otherNodeId == 'finishLine' && type === 'start' && count == 3){
    // console.log('Robot completed the course!');
    scene.setChallengeEventValue('lineFollow', true);
  }

  // console.log('Count: ' + count);
}, ['finishLine', 'n1', 'n2', 'n3', 'startBox']);
`;
const ROBOT_ORIGIN: ReferenceFramewUnits = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    x: Distance.centimeters(-15),
  },
};
export const JBC_24: Scene = {
  ...baseScene,
  name: tr('JBC 24'),
  description: tr('Junior Botball Challenge 24: Walk the Line'),
  scripts: {
    lineFollow: Script.ecmaScript('Line Follow', lineFollow),
  },
  geometry: {
    ...baseScene.geometry,
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(1.22),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(10),
      },
    },
    n_geom: {
      type: 'cylinder',
      radius: Distance.centimeters(1),
      height: Distance.centimeters(0.1),
    },
    finish_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(25),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(3.54),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    robot: {
      ...baseScene.nodes['robot'],
      startingOrigin: ROBOT_ORIGIN,
      origin: ROBOT_ORIGIN,
    },
    finishLine: {
      type: 'object',
      geometryId: 'finish_geom',
      name: tr('Finish Line'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(18),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(-5),
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
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: tr('Finish Line'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-70),
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

    n1: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Checkpoint 1'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(-18),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(28),
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

    n3: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Checkpoint 3'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(18),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(61),
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

    n2: {
      type: 'object',
      geometryId: 'n_geom',
      name: tr('Checkpoint 2'),
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(105),
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
