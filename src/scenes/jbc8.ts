import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_8: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 8' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 8: Serpentine' },
};