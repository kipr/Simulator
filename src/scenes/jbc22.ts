import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_22: Scene = {
  ...baseScene,
  name: tr('JBC 22'),
  description: tr('Junior Botball Challenge 22: Stackerz'),
  nodes: {
    ...baseScene.nodes,
    'can5': createCanNode(5),
    'can7': createCanNode(7),
  }
};