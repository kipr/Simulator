import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_3C: Scene = {
  ...baseScene,
  name: tr('JBC 3C'),
  description: tr('Junior Botball Challenge 3C: Quick Get Away!'),
};