import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_21: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 21' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 21: Foot Tall` },
  nodes: {
    ...baseScene.nodes,
    'can9': createCanNode(9),
  }
};