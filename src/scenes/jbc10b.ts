import Scene from "../state/State/Scene";
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceB, createCanNode } from './jbcBase';

import tr from '@i18n';

const baseScene = createBaseSceneSurfaceB();

export const JBC_10B: Scene = {
  ...baseScene,
  name: tr('JBC 10B'),
  description: tr('Junior Botball Challenge 10: Solo Joust Jr.'),
  nodes: {
    ...baseScene.nodes,
    'can1': createCanNode(1, { x: Distance.centimeters(-13), y: Distance.centimeters(0), z: Distance.centimeters(17) }), // green line
    'can2': createCanNode(2, { x: Distance.centimeters(-17), y: Distance.centimeters(0), z: Distance.centimeters(41) }), // red line
    'can3': createCanNode(3, { x: Distance.centimeters(11.5), y: Distance.centimeters(0), z: Distance.centimeters(51) }), // yellow line
    'can4': createCanNode(4, { x: Distance.centimeters(10.5), y: Distance.centimeters(0), z: Distance.centimeters(23) }), // purple line
  }
};