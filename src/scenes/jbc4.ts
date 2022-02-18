import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_4: Scene = {
  ...baseScene,
  name: 'JBC 4',
  description: 'Junior Botball Challenge 4: Figure Eight',
  nodes: {
    ...baseScene.nodes,
    'can4': createCanNode(4),
    'can9': createCanNode(9),
  }
};