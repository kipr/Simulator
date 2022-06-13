import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_21: Scene = {
  ...baseScene,
  name: 'JBC 21',
  description: `Junior Botball Challenge 21: Foot Tall`,
  nodes: {
    ...baseScene.nodes,
    'can9': createCanNode(9),
  }
};