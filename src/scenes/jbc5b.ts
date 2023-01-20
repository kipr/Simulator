import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_5B: Scene = {
  ...baseScene,
  name: tr('src/scenes/jbc5b.ts/JBC_5B.name', 'JBC 5B Name'),
  description: tr('src/scenes/jbc5b.ts/JBC_5B.description', 'JBC 5B Description')
};