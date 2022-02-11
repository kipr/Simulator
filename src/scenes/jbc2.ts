import Scene from "../state/State/Scene";

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_2: Scene = {
  ...baseScene,
  name: 'JBC 2',
  description: 'Junior Botball Challenge 2: Ring Around the Can',
  nodes: {
    ...baseScene.nodes,
    'can6': createCanNode(6),
  }
};