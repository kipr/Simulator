import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_3: Scene = {
  ...baseScene,
  name: tr('JBC 3'),
  description: tr('Junior Botball Challenge 3: Precision Parking'),
};