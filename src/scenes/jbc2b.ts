import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_2B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 2B' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 2B: Ring Around the Can, Sr.' },
  nodes: {
    ...baseScene.nodes,
    'can10': createCanNode(10),
    'can11': createCanNode(11),
    'can12': createCanNode(12),
  }
};