import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_6: Scene = {
  ...baseScene,
  name: tr('JBC 6'),
  description: tr('Junior Botball Challenge 6: Load \'Em Up'),
  nodes: {
    ...baseScene.nodes,
    'can2': createCanNode(2),
    'can9': createCanNode(9),
    'can10': createCanNode(10),
  }
};