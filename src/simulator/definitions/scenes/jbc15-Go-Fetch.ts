import Scene from '../../../state/State/Scene';
import Script from '../../../state/State/Scene/Script';
import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';
import tr from '@i18n';
import { matAStartGeoms, matAStartNodes, setNodeVisible, notInStartBox, nodeUpright } from './jbcCommonComponents';

const baseScene = createBaseSceneSurfaceA();

const enterStartBox = `
${setNodeVisible}

scene.addOnIntersectionListener('can11', (type, otherNodeId) => {
  // console.log('Robot returned start box!', type, otherNodeId);
  if(scene.programStatus === 'running'){
    scene.setChallengeEventValue('canInStartBox', type === 'start');
    setNodeVisible('startBox', type == 'start');
  }
}, 'startBox');
`;

const uprightCan = `
${nodeUpright}

scene.addOnRenderListener(() => {
  console.log('Can 11 upright:', nodeUpright('can11'));
  scene.setChallengeEventValue('can11Upright', nodeUpright('can11'));
});
`;

export const JBC_15: Scene = {
  ...baseScene,
  name: tr('JBC 15'),
  description: tr('Junior Botball Challenge 15: Go Fetch'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    enterStartBox: Script.ecmaScript('Enter Start Box', enterStartBox),
    uprightCans: Script.ecmaScript('Upright Can', uprightCan),
  },
  geometry: {
    ...baseScene.geometry,
    ...matAStartGeoms,
  },

  nodes: {
    ...baseScene.nodes,
    ...matAStartNodes,
    can11: createCanNode(11),
  },
};
