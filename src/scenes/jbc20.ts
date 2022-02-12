import Scene from "../state/State/Scene";
import { Distance, Mass } from "../util";

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_20: Scene = {
  ...baseScene,
  name: 'JBC 20',
  description: `Junior Botball Challenge 20: Rescue the Cans`,
  geometry: {
    ...baseScene.geometry,
    'ream': {
      type: 'box',
      size: {
        x: Distance.centimeters(27.94),
        y: Distance.centimeters(5.08),
        z: Distance.centimeters(21.59),
      },
    },
  },
  nodes: {
    ...baseScene.nodes,
    'can2': createCanNode(2),
    'can9': createCanNode(9),
    'can10': createCanNode(10),
    'can12': createCanNode(12),
    'ream': {
      type: 'object',
      geometryId: 'ream',
      name: 'Paper Ream',
      origin: {
        position: {
          x: Distance.centimeters(12),
          y: Distance.centimeters(106),
          z: Distance.centimeters(-47),
        },
      },
      visible: true,
      physics: {
        type: 'box',
        restitution: 0,
        friction: 1,
        mass: Mass.pounds(5),
      },
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
        y: Distance.centimeters(111),
        z: Distance.centimeters(-50),
      },
    }
  },
};