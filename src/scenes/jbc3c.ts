import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_3C: Scene = {
  ...baseScene,
  name: 'JBC 3C',
  description: 'Junior Botball Challenge 3C: Quick Get Away!',
};