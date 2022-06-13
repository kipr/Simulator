import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_9B: Scene = {
  ...baseScene,
  name: 'JBC 9B',
  description: 'Junior Botball Challenge 9B: Balancing Act',
};