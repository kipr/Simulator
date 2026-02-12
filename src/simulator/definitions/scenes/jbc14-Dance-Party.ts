import Scene from '../../../state/State/Scene';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import { Distance } from '../../../util';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const leftStartBox = `
scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot left start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('leaveStartBox', type === 'end');
  }
}, 'startBox');
`;

const dance = `
// let degrees = [];
let clockwiseDegrees = [false, false, false, false];
let counterClockwiseDegrees = [false, false, false, false];
let waveStart = -1;
let waveMax = 0;

const robotNode = scene.nodes['robot'];

const EULER_IDENTITY = RotationwUnits.EulerwUnits.identity();
const xAngle = (nodeId) => 180 / Math.PI * Math.acos(Vector3wUnits.dot(Vector3wUnits.applyQuaternion(Vector3wUnits.X, RotationwUnits.toRawQuaternion(scene.nodes[nodeId].origin.orientation || EULER_IDENTITY)), Vector3wUnits.X));

scene.addOnRenderListener(() => {
  let angle = xAngle('robot');
  console.log('X Angle: ', angle);
  
  // Wave
  if (scene.programStatus === 'running') {
    if (waveStart == -1) {
      waveStart = robotNode.state.getServo(0).position;
      // console.log('Wave start at ', waveStart);
    }
    else {
      // console.log('Wave diff at ', Math.abs(Math.abs(robotNode.state.getServo(0).position - waveStart) - waveMax));
      if (Math.abs(Math.abs(robotNode.state.getServo(0).position - waveStart) - waveMax) > 1) {
        waveMax = Math.abs(robotNode.state.getServo(0).position - waveStart);
        // console.log('Wave max at ', waveMax, 'Wave start at ', waveStart);
      }
      else {
        if (waveMax != 0) {
          scene.setChallengeEventValue('waveServo', true);
          // console.log('Robot waved!');
        }
      }
    }
  }
});
`;

export const JBC_14: Scene = {
  ...baseScene,
  name: tr('JBC 14'),
  description: tr('Junior Botball Challenge 14: Dance Party'),
  scripts: {
    dance: Script.ecmaScript('Dance Party', dance),
    leftStartBox: Script.ecmaScript('Robot Reentered Start', leftStartBox),
  },
  geometry: {
    ...baseScene.geometry,
    startBox_geom: {
      type: 'box',
      size: {
        x: Distance.meters(3.54),
        y: Distance.centimeters(0.1),
        z: Distance.centimeters(0),
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
