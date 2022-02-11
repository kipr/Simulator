import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_22: Scene = {
  ...baseScene,
  name: 'JBC 22',
  description: `Junior Botball Challenge 22: Stackerz`,
  nodes: {
    ...baseScene.nodes,
    'can5': createCanNode(5),
    'can7': createCanNode(7),
  }
};