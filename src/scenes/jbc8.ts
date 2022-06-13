import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_8: Scene = {
  ...baseScene,
  name: 'JBC 8',
  description: 'Junior Botball Challenge 8: Serpentine',
};