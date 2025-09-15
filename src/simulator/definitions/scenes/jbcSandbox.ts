import Scene from '../../../state/State/Scene';
import { ReferenceFramewUnits, RotationwUnits } from '../../../util/math/unitMath';
import { Distance } from '../../../util';

import { createCanNode, createBaseSceneSurfaceA, JBC_MAT_ORIGIN } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const REAM1_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(5),
    z: Distance.centimeters(67.5),
  },
  orientation: RotationwUnits.AxisAngle.fromRaw({
    axis: { x: 1, y: 0, z: 0 },
    angle: -Math.PI / 2,
  }),
};

const REAM2_ORIGIN: ReferenceFramewUnits = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(5),
    z: Distance.centimeters(-6.3),
  },
  orientation: RotationwUnits.AxisAngle.fromRaw({
    axis: { x: 1, y: 0, z: 0 },
    angle: -Math.PI / 2,
  }),
};

export const JBC_Sandbox: Scene = {
  ...baseScene,
  name: tr('JBC Sandbox'),
  description: tr('Junior Botball Challenge Sandbox. Starting Mat is A but B can also be shown instead. All cans 1-12 are available by default.'),
  nodes: {
    ...baseScene.nodes,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
    'matB': {
      type: 'from-jbc-template',
      templateId: 'matB',
      name: tr('JBC Mat B'),
      startingOrigin: JBC_MAT_ORIGIN,
      origin: JBC_MAT_ORIGIN,
      visible: false,
      editable: false,
    },
    'can1': createCanNode(1, undefined, true, false),
    'can2': createCanNode(2, undefined, true, false),
    'can3': createCanNode(3, undefined, true, false),
    'can4': createCanNode(4, undefined, true, false),
    'can5': createCanNode(5, undefined, true, false),
    'can6': createCanNode(6, undefined, true, false),
    'can7': createCanNode(7, undefined, true, false),
    'can8': createCanNode(8, undefined, true, false),
    'can9': createCanNode(9, undefined, true, false),
    'can10': createCanNode(10, undefined, true, false),
    'can11': createCanNode(11, undefined, true, false),
    'can12': createCanNode(12, undefined, true, false),
    'ream1': {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: tr('Paper Ream 1'),
      startingOrigin: REAM1_ORIGIN,
      origin: REAM1_ORIGIN,
      editable: true,
      visible: false,
    },
    'ream2': {
      type: 'from-jbc-template',
      templateId: 'ream',
      name: tr('Paper Ream 2'),
      startingOrigin: REAM2_ORIGIN,
      origin: REAM2_ORIGIN,
      editable: true,
      visible: false,
    },
  }
};
