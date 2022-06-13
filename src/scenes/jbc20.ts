import Scene from "../state/State/Scene";
import { Distance, Mass } from "../util";

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_20: Scene = {
  ...baseScene,
  name: 'JBC 20',
  description: `Junior Botball Challenge 20: Rescue the Cans`,
  nodes: {
    ...baseScene.nodes,
    'can2': createCanNode(2),
    'can9': createCanNode(9),
    'can10': createCanNode(10),
    'can12': createCanNode(12),
    'ream': {
      type: 'from-template',
      templateId: 'ream',
      name: 'Paper Ream',
      origin: {
        position: {
          x: Distance.centimeters(12),
          y: Distance.centimeters(-3),
          z: Distance.centimeters(-47),
        },
      },
      visible: true,
    },
  },
  // The normal starting position of the robot doesn't leave room for the paper ream in the starting box
  // Start the robot on the left side so that a ream fits on the right side
  robot: {
    ...baseScene.robot,
    origin: {
      ...baseScene.robot.origin,
      position: {
        x: Distance.centimeters(-18),
        y: Distance.centimeters(2),
        z: Distance.centimeters(-50),
      },
    }
  },
};