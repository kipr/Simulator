import Scene from "../state/State/Scene";
import { Distance } from "../util";

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_7B: Scene = {
  ...baseScene,
  name: 'JBC 7B',
  description: `Junior Botball Challenge 7B: Cover Your Bases`,
  nodes: {
    ...baseScene.nodes,
    'can1': createCanNode(1, { x: Distance.centimeters(-24), y: Distance.centimeters(109), z: Distance.centimeters(-34.5) }),
    'can2': createCanNode(2, { x: Distance.centimeters(-16), y: Distance.centimeters(109), z: Distance.centimeters(-34.5) }),
    'can3': createCanNode(3, { x: Distance.centimeters(-8), y: Distance.centimeters(109), z: Distance.centimeters(-34.5) }),
    'can4': createCanNode(4, { x: Distance.centimeters(0), y: Distance.centimeters(109), z: Distance.centimeters(-34.5) }),
    'can5': createCanNode(5, { x: Distance.centimeters(8), y: Distance.centimeters(109), z: Distance.centimeters(-34.5) }),
    'can6': createCanNode(7, { x: Distance.centimeters(16), y: Distance.centimeters(109), z: Distance.centimeters(-34.5) }),
    'can7': createCanNode(6, { x: Distance.centimeters(24), y: Distance.centimeters(109), z: Distance.centimeters(-34.5) }),
  },
  // The normal starting position of the robot covers the tape
  // Start the robot back a bit so that a can fits on the tape in front of the robot
  robot: {
    ...baseScene.robot,
    origin: {
      ...baseScene.robot.origin,
      position: {
        x: Distance.centimeters(0),
        y: Distance.centimeters(111),
        z: Distance.centimeters(-58),
      },
    }
  }
};