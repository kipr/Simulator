import Scene from '../../../state/State/Scene';
import { createBaseSceneSurfaceA, createCircleNode } from './jbcBase';
import Script from '../../../state/State/Scene/Script';
import tr from '@i18n';
import { matAStartGeoms, matAStartNodes, setNodeVisible, notInStartBox } from './jbcCommonComponents';

const baseScene = createBaseSceneSurfaceA();

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
${setNodeVisible}

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
    ...matAStartGeoms,
  },
  nodes: {
    ...baseScene.nodes,
    ...matAStartNodes,
    circle3: createCircleNode(3, undefined, false, false),
    circle6: createCircleNode(6, undefined, false, false),
    circle9: createCircleNode(9, undefined, false, false),
    circle12: createCircleNode(12, undefined, false, false),
  },
};
