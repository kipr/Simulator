import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_13: Scene = {
  ...baseScene,
  name: tr('JBC 13'),
  description: tr('Junior Botball Challenge 13: Clean the Mat'),
  nodes: {
    ...baseScene.nodes,
    'can2': createCanNode(2),
    'can5': createCanNode(5),
    'can8': createCanNode(8),
    'can10': createCanNode(10),
    'can11': createCanNode(11),
  }
};