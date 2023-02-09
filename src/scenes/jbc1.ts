import Scene from '../state/State/Scene';
import LocalizedString from '../util/LocalizedString';

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_1: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 1' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 1: Tag, You're It!`,
  },

  nodes: {
    ...baseScene.nodes,
    can9: createCanNode(9),
  },
};
