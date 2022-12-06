import Scene from "../state/State/Scene";
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_6C: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 6C' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 6C: Empty the Garage` },
  nodes: {
    ...baseScene.nodes,
    'can1': createCanNode(1, { x: Distance.centimeters(0), y: Distance.centimeters(0), z: Distance.centimeters(53.3) }),
    'can2': createCanNode(2, { x: Distance.centimeters(18.5), y: Distance.centimeters(0), z: Distance.centimeters(78) }),
    'can3': createCanNode(3, { x: Distance.centimeters(-12.3), y: Distance.centimeters(0), z: Distance.centimeters(93.9) }),
  }
};