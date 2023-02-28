import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';

import tr from '@i18n';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_7: Scene = {
  ...baseScene,
  name: tr('JBC 7'),
  description: tr('Junior Botball Challenge 7: Bulldozer Mania'),
  nodes: {
    ...baseScene.nodes,
    'can1': createCanNode(1),
    'can2': createCanNode(2),
    'can3': createCanNode(3),
    'can4': createCanNode(4),
    'can5': createCanNode(5),
    'can6': createCanNode(6),
    'can7': createCanNode(7),
    'can8': createCanNode(8),
    'can9': createCanNode(9),
    'can10': createCanNode(10),
    'can11': createCanNode(11),
    'can12': createCanNode(12),
  }
};