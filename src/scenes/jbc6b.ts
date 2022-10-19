import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_6B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 6B' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 6B: Pick 'Em Up` },
  nodes: {
    ...baseScene.nodes,
    'can2': createCanNode(2),
    'can9': createCanNode(9),
    'can10': createCanNode(10),
  }
};