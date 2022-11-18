import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_3C: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 3C' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 3C: Quick Get Away!' },
};