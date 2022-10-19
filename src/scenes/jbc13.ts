import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_13: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 13' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 13: Clean the Mat` },
  nodes: {
    ...baseScene.nodes,
    'can2': createCanNode(2),
    'can5': createCanNode(5),
    'can8': createCanNode(8),
    'can10': createCanNode(10),
    'can11': createCanNode(11),
  }
};