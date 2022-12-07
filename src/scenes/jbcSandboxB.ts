import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceB } from './jbcBase';

const baseScene = createBaseSceneSurfaceB();

export const JBC_Sandbox_B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC Sandbox B' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge Sandbox on Mat B.` },
  nodes: {
    ...baseScene.nodes,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
  }
};