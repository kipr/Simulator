import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_4B: Scene = {
  ...baseScene,
  name: 'JBC 4B',
  description: 'Junior Botball Challenge 4B: Barrel Racing',
  nodes: {
    ...baseScene.nodes,
    'can5': createCanNode(5),
    'can8': createCanNode(8),
    'can9': createCanNode(9),
  }
};