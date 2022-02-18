import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_3: Scene = {
  ...baseScene,
  name: 'JBC 3',
  description: 'Junior Botball Challenge 3: Precision Parking',
};