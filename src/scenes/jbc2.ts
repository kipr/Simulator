import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_2: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 2' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 2: Ring Around the Can' },
  nodes: {
    ...baseScene.nodes,
    'can6': createCanNode(6),
  }
};