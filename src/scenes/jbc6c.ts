import Scene from "../state/State/Scene";
import { Distance } from "../util";

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_6C: Scene = {
  ...baseScene,
  name: 'JBC 6C',
  description: `Junior Botball Challenge 6C: Empty the Garage`,
  nodes: {
    ...baseScene.nodes,
    'can1': createCanNode(1, { x: Distance.centimeters(0), y: Distance.centimeters(0), z: Distance.centimeters(3.3) }),
    'can2': createCanNode(2, { x: Distance.centimeters(-18.5), y: Distance.centimeters(0), z: Distance.centimeters(28) }),
    'can3': createCanNode(3, { x: Distance.centimeters(12.3), y: Distance.centimeters(0), z: Distance.centimeters(43.9) }),
  }
};