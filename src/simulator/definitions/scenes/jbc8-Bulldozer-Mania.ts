import Scene from '../../../state/State/Scene';
import Script from '../../../state/State/Scene/Script';
import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';
import { matAStartGeoms, matAStartNodes, nodeUpright, notInStartBox } from './jbcCommonComponents';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const uprightStartBoxCans = `
${nodeUpright}

const cans = new Map([
['can1', false],
['can2', false],
['can3', false],
['can4', false],
['can5', false],
['can6', false],
['can7', false],
['can8', false],
['can9', false],
['can10', false],
['can11', false],
['can12', false],
]);

scene.addOnRenderListener(() => {
  if(scene.programStatus !== 'running'){
    for (const k of cans.keys()) {
      cans.set(k, false);
    }
  }
});

scene.addOnIntersectionListener('startBox', (type, otherNodeId) => {
  if(scene.programStatus === 'running'){
  const upright = nodeUpright(otherNodeId);
    if(type === 'start'){
      cans.set(otherNodeId, upright);
    } else if(type === 'end') {
      cans.set(otherNodeId, false)
    }
    const count = cans.values().reduce((count, v) => v ? ++count : count, 0);
    scene.setChallengeEventValue('canAUpright', count > 0);
    scene.setChallengeEventValue('canBUpright', count > 1);
    scene.setChallengeEventValue('canCUpright', count > 2);
    scene.setChallengeEventValue('canDUpright', count > 3);
    scene.setChallengeEventValue('canEUpright', count > 4);
    // console.log('Upright Count: " + count + " (" + otherNodeId + ") " + type + " ' + yAngle(otherNodeId));
  }
}, cans.keys().toArray());
`;

export const JBC_8: Scene = {
  ...baseScene,
  name: tr('JBC 8'),
  description: tr('Junior Botball Challenge 8: Bulldozer Mania'),
  scripts: {
    uprightStartBoxCans: Script.ecmaScript('Upright Start Box Cans', uprightStartBoxCans),
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
  },
  geometry: {
    ...baseScene.geometry,
    ...matAStartGeoms,
  },
  nodes: {
    ...baseScene.nodes,
    ...matAStartNodes,
    can1: createCanNode(1),
    can2: createCanNode(2),
    can3: createCanNode(3),
    can4: createCanNode(4),
    can5: createCanNode(5),
    can6: createCanNode(6),
    can7: createCanNode(7),
    can8: createCanNode(8),
    can9: createCanNode(9),
    can10: createCanNode(10),
    can11: createCanNode(11),
    can12: createCanNode(12),
  },
};
