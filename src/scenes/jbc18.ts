import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_18: Scene = {
  ...baseScene,
  name: 'JBC 18',
  description: 'Junior Botball Challenge 18: I See Black',
};