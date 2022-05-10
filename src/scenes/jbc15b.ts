import Scene from "../state/State/Scene";
import { Rotation } from "../unit-math";
import { Distance, Mass } from "../util";

import { createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_15B: Scene = {
  ...baseScene,
  name: 'JBC 15B',
  description: `Junior Botball Challenge 15B: Bump Bump`,
  nodes: {
    ...baseScene.nodes,
    'ream1': {
      type: 'from-template',
      templateId: 'ream',
      name: 'Paper Ream 1',
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(114),
          z: Distance.centimeters(-2),
        },
        orientation: Rotation.AngleAxis.fromRaw({
          axis: { x: 1, y: 0, z: 0 },
          angle: -Math.PI / 2,
        }),
      },
      visible: true,
    },
    'ream2': {
      type: 'from-template',
      templateId: 'ream',
      name: 'Paper Ream 2',
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(114),
          z: Distance.centimeters(-56.3),
        },
        orientation: Rotation.AngleAxis.fromRaw({
          axis: { x: 1, y: 0, z: 0 },
          angle: -Math.PI / 2,
        }),
      },
      visible: true,
    },
  },
  // The normal starting position of the robot doesn't leave room for the paper ream in the starting box
  // Start the robot forward a bit so that a ream fits behind it
  robot: {
    ...baseScene.robot,
    origin: {
      ...baseScene.robot.origin,
      position: {
        x: Distance.centimeters(0),
        y: Distance.centimeters(111),
        z: Distance.centimeters(-43),
      },
    }
  },
};