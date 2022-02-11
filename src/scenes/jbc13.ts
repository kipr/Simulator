import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_13: Scene = {
  ...baseScene,
  name: 'JBC 13',
  description: `Junior Botball Challenge 13: Clean the Mat`,
  nodes: {
    ...baseScene.nodes,
    'can2': createCanNode(2),
    'can5': createCanNode(5),
    'can8': createCanNode(8),
    'can10': createCanNode(10),
    'can11': createCanNode(11),
  }
};