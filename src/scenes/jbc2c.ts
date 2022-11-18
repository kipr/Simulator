import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_2C: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 2C' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 2C: Back It Up' },
  nodes: {
    ...baseScene.nodes,
    'can6': createCanNode(6),
  }
};