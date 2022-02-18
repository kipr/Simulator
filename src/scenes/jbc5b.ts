import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_5B: Scene = {
  ...baseScene,
  name: 'JBC 5B',
  description: 'Junior Botball Challenge 5B: Line Dance',
};