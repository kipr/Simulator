import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceB } from './jbcBase';

const baseScene = createBaseSceneSurfaceB();

export const JBC_5C: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 5C' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 5C: Synchronized Dancing' },
};