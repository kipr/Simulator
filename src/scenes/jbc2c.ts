import Scene from "../state/State/Scene";

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_2C: Scene = {
  ...baseScene,
  name: 'JBC 2C',
  description: 'Junior Botball Challenge 2C: Back It Up',
  nodes: {
    ...baseScene.nodes,
    'can6': createCanNode(6),
  }
};