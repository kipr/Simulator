import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_5: Scene = {
  ...baseScene,
  name: tr('src/scenes/jbc5.ts/JBC_5.name', 'JBC 5 Name'),
  description: tr('src/scenes/jbc5.ts/JBC_5.description', 'JBC 5 Description')
};