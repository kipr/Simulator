import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_6: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 6' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 6: Load 'Em Up` },
  nodes: {
    ...baseScene.nodes,
    'can2': createCanNode(2),
    'can9': createCanNode(9),
    'can10': createCanNode(10),
  }
};