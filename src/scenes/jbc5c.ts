import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceB } from './jbcBase';

const baseScene = createBaseSceneSurfaceB();

export const JBC_5C: Scene = {
  ...baseScene,
  name: 'JBC 5C',
  description: 'Junior Botball Challenge 5C: Synchronized Dancing',
};