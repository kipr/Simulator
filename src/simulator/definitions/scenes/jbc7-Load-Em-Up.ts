import Scene from '../../../state/State/Scene';
import Script from '../../../state/State/Scene/Script';
import { ReferenceFramewUnits, RotationwUnits, Vector3wUnits } from '../../../util/math/unitMath';
import { createBaseSceneSurfaceA, createCanNode, createCircleNode } from './jbcBase';
import { garageGeoms, garageNodes, matAStartGeoms, matAStartNodes, nodeUpright, notInStartBox, setNodeVisible } from './jbcCommonComponents';
import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const canIntersectsGarage = `
${setNodeVisible}

// When the can (can2) is intersecting the green garage, the garage glows
scene.addOnIntersectionListener('can2', (type, otherNodeId) => {
  const visible = type === 'start';
  scene.setChallengeEventValue('can2Intersects', visible);
  setNodeVisible('greenGarage', visible);
}, 'greenGarage');

// When the can (can9) is intersecting the blue garage, the garage glows
scene.addOnIntersectionListener('can9', (type, otherNodeId) => {
  const visible = type === 'start';
  scene.setChallengeEventValue('can9Intersects', visible);
  setNodeVisible('blueGarage', visible);
}, 'blueGarage');

scene.addOnIntersectionListener('can10', (type, otherNodeId) => {
  const visible = type === 'start';
  scene.setChallengeEventValue('can10Intersects', visible);
  setNodeVisible('yellowGarage', visible);
}, 'yellowGarage');
`;

const uprightCans = `
${nodeUpright}

scene.addOnRenderListener(() => {
  scene.setChallengeEventValue('can2Upright', nodeUpright('can2'));
  scene.setChallengeEventValue('can9Upright', nodeUpright('can9'));
  scene.setChallengeEventValue('can10Upright', nodeUpright('can10'));
});
`;

export const JBC_7: Scene = {
  ...baseScene,
  name: tr('JBC 7'),
  description: tr('Junior Botball Challenge 7: Load \'Em Up'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    uprightCans: Script.ecmaScript('Upright Cans', uprightCans),
    canIntersectsGarage: Script.ecmaScript('Can Intersects Garage', canIntersectsGarage),
  },
  geometry: {
    ...baseScene.geometry,
    notStartBoxGeom: matAStartGeoms.notStartBoxGeom,
    ...garageGeoms,
  },
  nodes: {
    ...baseScene.nodes,
    notStartBox: matAStartNodes.notStartBox,
    ...garageNodes,

    circle2: createCircleNode(2),
    circle9: createCircleNode(9),
    circle10: createCircleNode(10),

    can2: createCanNode(2),
    can9: createCanNode(9),
    can10: createCanNode(10),
  },
};
