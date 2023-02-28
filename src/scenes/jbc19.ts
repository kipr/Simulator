import Scene from "../state/State/Scene";
import { Rotation, ReferenceFrame } from "../unit-math";
import { Distance, Mass } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const REAM_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(-10),
    y: Distance.centimeters(-3),
    z: Distance.centimeters(91.6),
  },
  orientation: Rotation.AxisAngle.fromRaw({
    axis: { x: 0, y: 1, z: 0 },
    angle: -Math.PI / 4,
  }),
};

export const JBC_19: Scene = {
  ...baseScene,
  name: tr('JBC 19'),
  description: tr('Junior Botball Challenge 19: Mountain Rescue'),
  nodes: {
    ...baseScene.nodes,
    'can1': createCanNode(1, { x: Distance.centimeters(-3), y: Distance.centimeters(6), z: Distance.centimeters(98.6) }),
    'can2': createCanNode(2, { x: Distance.centimeters(-10), y: Distance.centimeters(6), z: Distance.centimeters(91.6) }),
    'can3': createCanNode(3, { x: Distance.centimeters(-17), y: Distance.centimeters(6), z: Distance.centimeters(84.6) }),
    'ream': {
      type: 'from-template',
      templateId: 'ream',
      name: tr('Paper Ream'),
      startingOrigin: REAM_ORIGIN,
      origin: REAM_ORIGIN,
      visible: true,
    },
  }
};