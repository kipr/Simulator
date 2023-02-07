import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_2: Scene = {
  ...baseScene,
  name: tr('JBC 2'),
  description: tr('Junior Botball Challenge 2: Ring Around the Can'),
  nodes: {
    ...baseScene.nodes,
    'can6': createCanNode(6),
  }
};