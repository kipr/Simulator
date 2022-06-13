import Scene from "../state/State/Scene";

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_1: Scene = {
  ...baseScene,
  name: 'JBC 1',
  description: `Junior Botball Challenge 1: Tag, You're It!`,
  nodes: {
    ...baseScene.nodes,
    'can9': createCanNode(9),
  }
};