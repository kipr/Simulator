import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_5: Scene = {
  ...baseScene,
  name: 'JBC 5',
  description: 'Junior Botball Challenge 5: Dance Party',
};