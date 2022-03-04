import Scene from "../state/State/Scene";
import { Distance } from "../util";

import { createBaseSceneSurfaceB, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceB();

export const JBC_10B: Scene = {
  ...baseScene,
  name: 'JBC 10B',
  description: 'Junior Botball Challenge 10: Solo Joust Jr.',
  nodes: {
    ...baseScene.nodes,
    'can1': createCanNode(1, { x: Distance.centimeters(13), y: Distance.centimeters(109), z: Distance.centimeters(-33) }), // green line
    'can2': createCanNode(2, { x: Distance.centimeters(17), y: Distance.centimeters(109), z: Distance.centimeters(-9) }), // red line
    'can3': createCanNode(3, { x: Distance.centimeters(-11.5), y: Distance.centimeters(109), z: Distance.centimeters(1) }), // yellow line
    'can4': createCanNode(4, { x: Distance.centimeters(-10.5), y: Distance.centimeters(109), z: Distance.centimeters(-27) }), // purple line
  }
};