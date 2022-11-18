import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_3: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 3' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 3: Precision Parking' },
};