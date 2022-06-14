import Scene from "../state/State/Scene";
import { Distance } from "../util";

import { createBaseSceneSurfaceB } from './jbcBase';

const baseScene = createBaseSceneSurfaceB();

export const JBC_17: Scene = {
  ...baseScene,
  name: 'JBC 17',
  description: 'Junior Botball Challenge 17: Walk the Line',
  // Start the robot on the black tape
  robot: {
    ...baseScene.robot,
    origin: {
      ...baseScene.robot.origin,
      position: {
        x: Distance.centimeters(16.5),
        y: Distance.centimeters(2),
        z: Distance.centimeters(0),
      },
    }
  },
};