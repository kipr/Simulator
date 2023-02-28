import Scene from "../state/State/Scene";
import { ReferenceFrame } from '../unit-math';
import { Distance, Mass } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

const ROBOT_ORIGIN: ReferenceFrame = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    x: Distance.centimeters(18)
  },
};

const REAM_ORIGIN: ReferenceFrame = {
  position: {
    x: Distance.centimeters(-12),
    y: Distance.centimeters(-3),
    z: Distance.centimeters(3),
  },
};

export const JBC_20: Scene = {
  ...baseScene,
  name: tr('JBC 20'),
  description: tr('Junior Botball Challenge 20: Rescue the Cans'),
  nodes: {
    ...baseScene.nodes,
    // The normal starting position of the robot doesn't leave room for the paper ream in the starting box
    // Start the robot on the left side so that a ream fits on the right side
    'robot': {
      ...baseScene.nodes['robot'],
      startingOrigin: ROBOT_ORIGIN,
      origin: ROBOT_ORIGIN
    },
    'can2': createCanNode(2),
    'can9': createCanNode(9),
    'can10': createCanNode(10),
    'can12': createCanNode(12),
    'ream': {
      type: 'from-template',
      templateId: 'ream',
      name: tr('Paper Ream'),
      startingOrigin: REAM_ORIGIN,
      origin: REAM_ORIGIN,
      visible: true,
    },
  },
};