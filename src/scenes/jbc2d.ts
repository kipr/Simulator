import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceA();

export const JBC_2D: Scene = {
  ...baseScene,
  name: tr('JBC 2D'),
  description: tr('Junior Botball Challenge 2D: Ring Around the Can and Back It Up'),
  nodes: {
    ...baseScene.nodes,
    'can6': createCanNode(6),
  }
};