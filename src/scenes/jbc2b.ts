import Scene from "../state/State/Scene";

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_2B: Scene = {
  ...baseScene,
  name: 'JBC 2B',
  description: 'Junior Botball Challenge 2B: Ring Around the Can, Sr.',
  nodes: {
    ...baseScene.nodes,
    'can10': createCanNode(10),
    'can11': createCanNode(11),
    'can12': createCanNode(12),
  }
};