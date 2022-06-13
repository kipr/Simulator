import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_6B: Scene = {
  ...baseScene,
  name: 'JBC 6B',
  description: `Junior Botball Challenge 6B: Pick 'Em Up`,
  nodes: {
    ...baseScene.nodes,
    'can2': createCanNode(2),
    'can9': createCanNode(9),
    'can10': createCanNode(10),
  }
};