import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_3B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 3B' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 3B: Parallel Parking' },
};