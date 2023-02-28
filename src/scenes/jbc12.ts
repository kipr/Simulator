import Scene from "../state/State/Scene";
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_12: Scene = {
  ...baseScene,
  name: tr('JBC 12'),
  description: tr('Junior Botball Challenge 12: Unload \'Em'),
  nodes: {
    ...baseScene.nodes,
    'can1': createCanNode(1, { x: Distance.centimeters(0), y: Distance.centimeters(0), z: Distance.centimeters(53.3) }),
    'can2': createCanNode(2, { x: Distance.centimeters(18.5), y: Distance.centimeters(0), z: Distance.centimeters(78) }),
    'can3': createCanNode(3, { x: Distance.centimeters(-12.3), y: Distance.centimeters(0), z: Distance.centimeters(93.9) }),
  }
};