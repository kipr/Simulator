import Scene from '../../../state/State/Scene';
import LocalizedString from '../../../util/LocalizedString';
import { createBaseSceneSurfaceA, createCircleNode } from './jbcBase';
import { Color } from '../../../state/State/Scene/Color';
import { Distance } from '../../../util';
import Script from '../../../state/State/Scene/Script';
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

const wave = `
  // Check if robot waves
  let waveStart = -1;
  let waveMax = 0;

  scene.addOnRenderListener(() => {
    const robotNode = scene.nodes['robot'];
    
    if (scene.programStatus === 'running') {
      if (robotNode.state.getMotor(0).speedGoal == 0 && robotNode.state.getMotor(3).speedGoal == 0) {
        // console.log('Robot stopped, motors at: ', robotNode.state.getMotor(0).speedGoal, ' ', robotNode.state.getMotor(3).speedGoal);
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
              scene.setChallengeEventValue('wave', true);
              // console.log('Robot waved!');
            }
          }
        }
      }
      else {
        // console.log('Robot moving, motors at: ', robotNode.state.getMotor(0).pwm, ' ', robotNode.state.getMotor(3).pwm);
        waveStart =-1;
        waveMax = 0;
        scene.setChallengeEventValue('wave', false);
      }
    }
    else { 
      waveStart =-1;
      waveMax = 0;
    }
  });
`;

const circleIntersects = `
const setNodeVisible = (nodeId, visible) => scene.setNode(nodeId, {
  ...scene.nodes[nodeId],
  visible
});

scene.addOnIntersectionListener('robot', (type, otherNodeId) => {
  // console.log('Robot intersects!', type, otherNodeId);
  scene.setChallengeEventValue(otherNodeId + 'Touched', true);
  setNodeVisible(otherNodeId, true);
}, [ 'circle3', 'circle6', 'circle9', 'circle12' ]);
`;

export const JBC_11: Scene = {
  ...baseScene,
  name: tr('JBC 11'),
  description: tr('Junior Botball Challenge 11: Making Waves'),
  scripts: {
    inStartBox: Script.ecmaScript('In Start Box', notInStartBox),
    waitToChop: Script.ecmaScript('Wave', wave),
    circleIntersects: Script.ecmaScript('Circle Intersects', circleIntersects),
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
    circle3: createCircleNode(3, undefined, false, false),
    circle6: createCircleNode(6, undefined, false, false),
    circle9: createCircleNode(9, undefined, false, false),
    circle12: createCircleNode(12, undefined, false, false),
  },
};

