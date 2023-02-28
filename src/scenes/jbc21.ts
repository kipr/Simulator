import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_21: Scene = {
  ...baseScene,
  name: tr('JBC 21'),
  description: tr('Junior Botball Challenge 21: Foot Tall'),
  nodes: {
    ...baseScene.nodes,
    'can9': createCanNode(9),
  }
};