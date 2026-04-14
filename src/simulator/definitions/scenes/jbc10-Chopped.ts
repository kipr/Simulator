import Scene from '../../../state/State/Scene';
import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';
import Script from '../../../state/State/Scene/Script';
import { matAStartGeoms, matAStartNodes, notInStartBox } from './jbcCommonComponents';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const waitToChop = `
let can7Chopped = false;
scene.addOnIntersectionListener('claw_link', (type, otherNodeId) => {
  if(scene.programStatus === 'running'){
    // console.log('can7 touched');
    can7Chopped = true;
    scene.setChallengeEventValue('can7Chopped', can7Chopped);
  }
}, 'can7');
scene.addOnIntersectionListener('arm_link', (type, otherNodeId) => {
  if(scene.programStatus === 'running'){
    // console.log('can7 touched');
    can7Chopped = true;
    scene.setChallengeEventValue('can7Chopped', can7Chopped);
  }
}, 'can7');

// Need to wait 3 seconds before the can can be chopped
let currentDate;
let stopTime = 0;
scene.addOnRenderListener(() => {
  const robotNode = scene.nodes['robot'];

  if (
  robotNode.state.motors[0].speedGoal <= 15 &&
  robotNode.state.motors[3].speedGoal <= 15 &&
  !can7Chopped &&
  scene.programStatus === 'running'
  ) {
    if (stopTime == 0) {
      currentDate = new Date();
      stopTime = currentDate.getTime();
      // console.log('Waiting at ', stopTime);
    }
    else {
      currentDate = new Date();
      if (currentDate.getTime() - stopTime > 3000) {
        scene.setChallengeEventValue('waitedToChop', true);
        // console.log('Waited 3 seconds');
      }
    }
  }
  else {
    stopTime = 0;
  }
});
`;

export const JBC_10: Scene = {
  ...baseScene,
  name: tr('JBC 10'),
  description: tr('Junior Botball Challenge 10: Chopped'),
  scripts: {
    inStartBox: Script.ecmaScript('In Start Box', notInStartBox),
    waitToChop: Script.ecmaScript('Wait to Chop', waitToChop),
  },
  geometry: {
    ...baseScene.geometry,
    ...matAStartGeoms,
  },
  nodes: {
    ...baseScene.nodes,
    ...matAStartNodes,
    can7: createCanNode(7),
  },
};

