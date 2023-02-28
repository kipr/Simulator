import Scene from "../state/State/Scene";
import Script from '../state/State/Scene/Script';
import { ReferenceFrame, Rotation } from "../unit-math";
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const REAM1_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(5),
    z: Distance.centimeters(67.5),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 1, y: 0, z: 0 },
    angle: -Math.PI / 2,
  }),
};

const REAM2_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(0),
    y: Distance.centimeters(5),
    z: Distance.centimeters(-6.3),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 1, y: 0, z: 0 },
    angle: -Math.PI / 2,
  }),
};

export const JBC_Sandbox_A: Scene = {
  ...baseScene,
  name: tr('JBC Sandbox A'),
  description: tr('Junior Botball Challenge Sandbox on Mat A. All cans 1-12 are available by default.'),
  nodes: {
    ...baseScene.nodes,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
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
      type: 'from-template',
      templateId: 'ream',
      name: tr('Paper Ream 1'),
      startingOrigin: REAM1_ORIGIN,
      origin: REAM1_ORIGIN,
      editable: true,
      visible: false,
    },
    'ream2': {
      type: 'from-template',
      templateId: 'ream',
      name: tr('Paper Ream 2'),
      startingOrigin: REAM2_ORIGIN,
      origin: REAM2_ORIGIN,
      editable: true,
      visible: false,
    },
  }
};