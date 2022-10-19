import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_22: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 22' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 22: Stackerz` },
  nodes: {
    ...baseScene.nodes,
    'can5': createCanNode(5),
    'can7': createCanNode(7),
  }
};