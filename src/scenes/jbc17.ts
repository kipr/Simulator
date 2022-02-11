import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceB } from './jbcBase';

const baseScene = createBaseSceneSurfaceB();

export const JBC_17: Scene = {
  ...baseScene,
  name: 'JBC 17',
  description: 'Junior Botball Challenge 17: Walk the Line',
};