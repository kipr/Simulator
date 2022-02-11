import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceB } from './jbcBase';

const baseScene = createBaseSceneSurfaceB();

export const JBC_17B: Scene = {
  ...baseScene,
  name: 'JBC 17B',
  description: 'Junior Botball Challenge 17: Walk the Line II',
};