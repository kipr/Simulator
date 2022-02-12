import Scene from "../state/State/Scene";
import { Distance } from "../util";

import { createBaseSceneSurfaceB, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceB();

export const JBC_10: Scene = {
  ...baseScene,
  name: 'JBC 10',
  description: 'Junior Botball Challenge 10: Solo Joust',
  nodes: {
    ...baseScene.nodes,
    'can1': createCanNode(1, { x: Distance.centimeters(-11), y: Distance.centimeters(109), z: Distance.centimeters(41) }),
  }
};