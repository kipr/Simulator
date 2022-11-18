import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_9: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 9' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 9: Add It Up' },
};