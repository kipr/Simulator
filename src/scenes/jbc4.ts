import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

import tr from '@i18n';

export const JBC_4: Scene = {
  ...baseScene,
  name: tr('JBC 4'),
  description: tr('Junior Botball Challenge 4: Figure Eight'),
  nodes: {
    ...baseScene.nodes,
    'can4': createCanNode(4),
    'can9': createCanNode(9),
  }
};