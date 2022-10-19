import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_8B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 8B' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 8B: Serpentine Jr.' },
};