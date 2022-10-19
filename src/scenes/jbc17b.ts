import Scene from "../state/State/Scene";
import { Distance } from "../util";
import LocalizedString from '../util/LocalizedString';

import { createBaseSceneSurfaceB } from './jbcBase';

const baseScene = createBaseSceneSurfaceB();

export const JBC_17B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 17B' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 17: Walk the Line II' },
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