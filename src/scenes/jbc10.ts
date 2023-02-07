import Scene from "../state/State/Scene";
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceB, createCanNode } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceB();

export const JBC_10: Scene = {
  ...baseScene,
  name: tr('JBC 10'),
  description: tr('Junior Botball Challenge 10: Solo Joust'),
  nodes: {
    ...baseScene.nodes,
    'can1': createCanNode(1, { x: Distance.centimeters(11), y: Distance.centimeters(0), z: Distance.centimeters(91) }),
  }
};