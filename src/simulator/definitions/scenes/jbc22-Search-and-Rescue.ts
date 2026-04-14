import Scene from '../../../state/State/Scene';
import Script from '../../../state/State/Scene/Script';
import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';
import tr from '@i18n';
import { matAStartGeoms, matAStartNodes, setNodeVisible, notInStartBox, nodeUpright } from './jbcCommonComponents';

const baseScene = createBaseSceneSurfaceA();

const enterStartBox = `
${setNodeVisible}

scene.addOnIntersectionListener('can', (type, otherNodeId) => {
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
  scene.setChallengeEventValue('canUpright', nodeUpright('can'));
});
`;

function randomCan(): number {
  const cans = [2, 4, 6];
  const randomCan = cans[Math.floor(Math.random() * cans.length)];
  return randomCan;
}

export const JBC_22: Scene = {
  ...baseScene,
  name: tr('JBC 22'),
  description: tr('Junior Botball Challenge 22: Search and Rescue'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    enterStartBox: Script.ecmaScript('Enter Start Box', enterStartBox),
    uprightCan: Script.ecmaScript('Upright Can', uprightCan),
  },
  geometry: {
    ...baseScene.geometry,
    ...matAStartGeoms,
  },
  nodes: {
    ...baseScene.nodes,
    ...matAStartNodes,
    can: createCanNode(randomCan()),
  },
};
