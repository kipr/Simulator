import Scene from "../state/State/Scene";
import { ReferenceFrame } from '../unit-math';
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceB } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceB();

const ROBOT_ORIGIN: ReferenceFrame = {
  ...baseScene.nodes['robot'].origin,
  position: {
    ...baseScene.nodes['robot'].origin.position,
    x: Distance.centimeters(16.5),
  },
};

export const JBC_17B: Scene = {
  ...baseScene,
  name: tr('JBC 17B'),
  description: tr('Junior Botball Challenge 17: Walk the Line II'),
  // Start the robot on the black tape
  nodes: {
    ...baseScene.nodes,
    'robot': {
      ...baseScene.nodes['robot'],
      startingOrigin: ROBOT_ORIGIN,
      origin: ROBOT_ORIGIN
    },
  }
};