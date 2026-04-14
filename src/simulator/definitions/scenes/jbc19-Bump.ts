import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits, RotationwUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import Script from '../../../state/State/Scene/Script';
import { createBaseSceneSurfaceA } from './jbcBase';
import tr from '@i18n';
import { matAStartGeoms, matAStartNodes, notInStartBox } from './jbcCommonComponents';

const baseScene = createBaseSceneSurfaceA();

const bumpReam = `
// console.log('Bump Ream script loaded');
scene.addOnCollisionListener('ream1', (otherNodeId) => {
  //If front bumper is pressed
  if(scene.nodes['robot'].state.getDigitalValue(0) == 1) {
    scene.setChallengeEventValue('driveForwardTouch', true);
  }
}, 'robot');
`;

const REAM1_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(5),
    z: Distance.centimeters(48),
  },
  orientation: RotationwUnits.AxisAngle.fromRaw({
    axis: { x: 1, y: 0, z: 0 },
    angle: -Math.PI / 2,
  }),
};

export const JBC_19: Scene = {
  ...baseScene,
  name: tr('JBC 19'),
  description: tr('Junior Botball Challenge 19: Bump'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    bumpReam: Script.ecmaScript('Bump Ream', bumpReam),
  },
  geometry: {
    ...baseScene.geometry,
    ...matAStartGeoms,
  },
  nodes: {
    ...baseScene.nodes,
    ...matAStartNodes,
    ream1: {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: tr('Paper Ream 1'),
      startingOrigin: REAM1_ORIGIN,
      origin: REAM1_ORIGIN,
      visible: true,
    },
  },
};
