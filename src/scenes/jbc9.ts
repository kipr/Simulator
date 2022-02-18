import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_9: Scene = {
  ...baseScene,
  name: 'JBC 9',
  description: 'Junior Botball Challenge 9: Add It Up',
};