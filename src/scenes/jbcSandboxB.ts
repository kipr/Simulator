import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceB } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceB();

export const JBC_Sandbox_B: Scene = {
  ...baseScene,
  name: tr('JBC Sandbox B'),
  description: tr('Junior Botball Challenge Sandbox on Mat B.'),
  nodes: {
    ...baseScene.nodes,
    'robot': {
      ...baseScene.nodes['robot'],
      editable: true,
    },
  }
};