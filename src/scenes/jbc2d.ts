import Scene from "../state/State/Scene";

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_2D: Scene = {
  ...baseScene,
  name: 'JBC 2D',
  description: 'Junior Botball Challenge 2D: Ring Around the Can and Back It Up',
  nodes: {
    ...baseScene.nodes,
    'can6': createCanNode(6),
  }
};