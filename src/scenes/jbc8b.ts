import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_8B: Scene = {
  ...baseScene,
  name: 'JBC 8B',
  description: 'Junior Botball Challenge 8B: Serpentine Jr.',
};