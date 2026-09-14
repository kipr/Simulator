import Scene from '../../../../state/State/Scene';
import { Distance } from '../../../../util';
import Script from '../../../../state/State/Scene/Script';
import { Color } from '../../../../state/State/Scene/Color';
import tr from '@i18n';
import { createBaseSceneSurface } from '../26botballExplorerBase';
import { setNodeVisible, notInStartBox } from '../jbcCommonComponents';
import { startBox_geom, startBoxA } from './bexCommonComponents';
import { RotationwUnits } from '../../../../util/math/unitMath';
const baseScene = createBaseSceneSurface();

const reachedEnd = `
// If the robot reaches the end, it completes the challenge
${setNodeVisible}

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot reached end!', type, otherNodeId, scene.programStatus);
  const visible = type === 'start';
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('reachedEnd', type==='start');
    //setNodeVisible('endBox', visible);
  }
}, 'endBox');
`;

const noStop = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot did not stop!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('noStop', type === 'start');
  }
}, 'stopBox');
`;
const enterStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  console.log('Robot returned start box!', type, otherNodeId, scene.programStatus);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('returnToStartBox', type === 'start');
  }
}, 'startBoxA');
`;


export const BEX_1: Scene = {
  ...baseScene,
  name: tr('Botball Explorer 1'),
  description: tr('Botball Explorer Mission 1: Waypoint Alpha'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not In Start Box', notInStartBox),
    reachedEnd: Script.ecmaScript('Robot Reached End', reachedEnd),
    noStop: Script.ecmaScript('No Stop', noStop),
    enterStartBox: Script.ecmaScript('Bonus Return', enterStartBox),
  },
  geometry: {
    ...baseScene.geometry,
    startBox_geom,
    notStartBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(10),
        z: Distance.meters(2.13),
      },
    },
    endBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(27),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(32),
      },
    },
    stopBox_geom: {
      type: 'box',
      size: {
        x: Distance.centimeters(1),
        y: Distance.centimeters(10),
        z: Distance.centimeters(32),
      }
    }
  },
  nodes: {
    ...baseScene.nodes,
    startBoxA,
    notStartBox: {
      type: 'object',
      geometryId: 'notStartBox_geom',
      name: tr('Not Start Box'),
      origin: {
        position: {
          x: Distance.centimeters(-129.5),
          y: Distance.centimeters(6.1),
          z: Distance.centimeters(-5),
        },
        orientation: RotationwUnits.eulerDegrees(0, -90, 0),
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(255, 0, 0),
        },
      },
    },
    endBox: {
      type: 'object',
      geometryId: 'endBox_geom',
      name: tr('End Box'),
      origin: {
        position: {
          x: Distance.centimeters(-4.1),
          y: Distance.centimeters(-7.3),
          z: Distance.centimeters(40.5),
        },
        orientation: RotationwUnits.eulerDegrees(0, -90, 0),
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(0, 255, 0),
        },
      },
    },
    stopBox: {
      type: 'object',
      geometryId: 'stopBox_geom',
      name: tr('Stop Box'),
      origin: {
        position: {
          x: Distance.centimeters(-4.1),
          y: Distance.centimeters(-12),
          z: Distance.centimeters(59.652),
        },
        orientation: RotationwUnits.eulerDegrees(0, -90, 0),
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 255, 0),
        },
      },
    }
  }
};
