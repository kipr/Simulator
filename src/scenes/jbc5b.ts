import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_5B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 5B' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 5B: Line Dance' },
};