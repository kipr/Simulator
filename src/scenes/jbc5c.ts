import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceB } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceB();

export const JBC_5C: Scene = {
  ...baseScene,
  name: tr('src/scenes/jbc5c.ts/JBC_5C.name', 'JBC 5C Name'),
  description: tr('src/scenes/jbc5c.ts/JBC_5C.description', 'JBC 5C Description'),
};