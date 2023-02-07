import Scene from "../state/State/Scene";
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceB } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceB();

export const JBC_17: Scene = {
  ...baseScene,
  name: tr('JBC 17'),
  description: tr('Junior Botball Challenge 17: Walk the Line'),
};