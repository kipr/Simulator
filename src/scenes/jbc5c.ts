import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceB } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceB();

export const JBC_5C: Scene = {
  ...baseScene,
  name: tr('JBC 5C'),
  description: tr('Junior Botball Challenge 5C: Synchronized Dancing'),
};