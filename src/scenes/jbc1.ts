import Scene from '../state/State/Scene';
import LocalizedString from '../util/LocalizedString';

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_1: Scene = {
  ...baseScene,

  name: tr('JBC 1'),
  description: tr('Junior Botball Challenge 1: Tag, You\'re It!'),
  
  nodes: {
    ...baseScene.nodes,
    can9: createCanNode(9),
  },
};
