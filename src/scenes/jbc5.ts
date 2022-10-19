import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_5: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 5' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 5: Dance Party' },
};