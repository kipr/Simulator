import Scene from "../state/State/Scene";

import { createBaseSceneSurfaceA } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_5: Scene = {
  ...baseScene,
  name: tr('JBC 5'),
  description: tr('Junior Botball Challenge 5: Dance Party')
};