import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_5B: Scene = {
  ...baseScene,
  name: tr('JBC 5B'),
  description: tr('Junior Botball Challenge 5B: Line Dance')
};