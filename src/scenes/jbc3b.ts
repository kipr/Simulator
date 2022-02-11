import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_3B: Scene = {
  ...baseScene,
  name: 'JBC 3B',
  description: 'Junior Botball Challenge 3B: Parallel Parking',
};