import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_2D: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 2D' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 2D: Ring Around the Can and Back It Up' },
  nodes: {
    ...baseScene.nodes,
    'can6': createCanNode(6),
  }
};