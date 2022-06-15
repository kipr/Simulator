import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceB } from './jbcBase';

const baseScene = createBaseSceneSurfaceB();

export const JBC_Sandbox_B: Scene = {
  ...baseScene,
  name: 'JBC Sandbox B',
  description: `Junior Botball Challenge Sandbox on Mat B.`,
};