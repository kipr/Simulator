import Scene from '../../../state/State/Scene';
import { RotationwUnits, ReferenceFramewUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';
import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';
import Script from '../../../state/State/Scene/Script';
import tr from '@i18n';
import { matAStartGeoms, matAStartNodes, notInStartBox, nodeUpright } from './jbcCommonComponents';

const baseScene = createBaseSceneSurfaceA();

const rescuedCans = `
${nodeUpright}
const cans = new Map([
  ['can1', false],
  ['can2', false],
  ['can3', false],
  ['can4', false],
  ['can5', false]
]);

scene.addOnRenderListener(() => {
  if(scene.programStatus !== 'running'){
    for (const k of cans.keys()) {
      cans.set(k, false);
    }
  } else {
    let count = 0;
    for (const k of cans.keys()) {
      if (cans.get(k) && nodeUpright(k)) {
        count++;
      }
    }
    scene.setChallengeEventValue('can1Retrieved', count > 0);
    scene.setChallengeEventValue('can2Retrieved', count > 1);
    scene.setChallengeEventValue('can3Retrieved', count > 2);
  }
});

scene.addOnIntersectionListener('startBox', (type, otherNodeId) => {
  if (scene.programStatus === 'running') {
    if (type === 'start') {
      cans.set(otherNodeId, true);
    } else if (type === 'end') {
      cans.set(otherNodeId, false);
    }
  }
}, ['can1', 'can2', 'can3', 'can4', 'can5']);

`;
const REAM_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(-10),
    y: Distance.centimeters(-3),
    z: Distance.centimeters(91.6),
  },
  orientation: RotationwUnits.AxisAngle.fromRaw({
    axis: { x: 0, y: 1, z: 0 },
    angle: -Math.PI / 4,
  }),
};

export const JBC_17: Scene = {
  ...baseScene,
  name: tr('JBC 17'),
  description: tr('Junior Botball Challenge 17: Mountain Rescue'),
  scripts: {
    notInStartBox: Script.ecmaScript('Not in Start Box', notInStartBox),
    rescuedCans: Script.ecmaScript('Rescued Cans', rescuedCans),
  },
  geometry: {
    ...baseScene.geometry,
    ...matAStartGeoms,
  },
  nodes: {
    ...baseScene.nodes,
    ...matAStartNodes,
    can1: {
      ...createCanNode(1, {
        x: Distance.centimeters(3),
        y: Distance.centimeters(6),
        z: Distance.centimeters(94),
      }),
    },
    can2: {
      ...createCanNode(2, {
        x: Distance.centimeters(-10),
        y: Distance.centimeters(6),
        z: Distance.centimeters(91.6),
      }),
    },
    can3: {
      ...createCanNode(3, {
        x: Distance.centimeters(-12.2),
        y: Distance.centimeters(6),
        z: Distance.centimeters(78.3),
      }),
    },
    can4: {
      ...createCanNode(4, {
        x: Distance.centimeters(-7.8),
        y: Distance.centimeters(6),
        z: Distance.centimeters(104.9),
      }),
    },
    can5: {
      ...createCanNode(5, {
        x: Distance.centimeters(-23),
        y: Distance.centimeters(6),
        z: Distance.centimeters(89.5),
      }),
    },
    ream: {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: tr('Paper Ream'),
      startingOrigin: REAM_ORIGIN,
      origin: REAM_ORIGIN,
      visible: true,
    },
  },
};
