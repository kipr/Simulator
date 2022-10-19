import Scene from "../state/State/Scene";
import { Distance, Mass } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceA, createCanNode } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_20: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 20' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 20: Rescue the Cans` },
  nodes: {
    ...baseScene.nodes,
    // The normal starting position of the robot doesn't leave room for the paper ream in the starting box
    // Start the robot on the left side so that a ream fits on the right side
    'robot': {
      ...baseScene.nodes['robot'],
      origin: {
        ...baseScene.nodes['robot'].origin,
        position: {
          ...baseScene.nodes['robot'].origin.position,
          x: Distance.centimeters(-18)
        },
      }
    },
    'can2': createCanNode(2),
    'can9': createCanNode(9),
    'can10': createCanNode(10),
    'can12': createCanNode(12),
    'ream': {
      type: 'from-template',
      templateId: 'ream',
      name: { [LocalizedString.EN_US]: 'Paper Ream' },
      origin: {
        position: {
          x: Distance.centimeters(12),
          y: Distance.centimeters(-3),
          z: Distance.centimeters(3),
        },
      },
      visible: true,
    },
  },
};