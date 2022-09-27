import Scene from "../state/State/Scene";
import { Distance } from "../util";

import { createBaseSceneSurfaceB } from './jbcBase';

const baseScene = createBaseSceneSurfaceB();

export const JBC_17B: Scene = {
  ...baseScene,
  name: 'JBC 17B',
  description: 'Junior Botball Challenge 17: Walk the Line II',
  // Start the robot on the black tape
  nodes: {
    ...baseScene.nodes,
    'robot': {
      ...baseScene.nodes['robot'],
      origin: {
        ...baseScene.nodes['robot'].origin,
        position: {
          ...baseScene.nodes['robot'].origin.position,
          x: Distance.centimeters(16.5),
        },
      }
    },
  }
};