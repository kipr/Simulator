import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_6: Scene = {
  ...baseScene,
  name: 'JBC 6',
  description: `Junior Botball Challenge 6: Load 'Em Up`,
  nodes: {
    ...baseScene.nodes,
    'can2': createCanNode(2),
    'can9': createCanNode(9),
    'can10': createCanNode(10),
  }
};