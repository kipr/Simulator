import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_4B: Scene = {
  ...baseScene,
  name: tr('JBC 4B'),
  description: tr('Junior Botball Challenge 4B: Barrel Racing'),
  nodes: {
    ...baseScene.nodes,
    'can5': createCanNode(5),
    'can8': createCanNode(8),
    'can9': createCanNode(9),
  }
};