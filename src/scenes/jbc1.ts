import Scene from "../state/State/Scene";
import LocalizedString from '../util/LocalizedString';
import { Distance } from "../util";

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_1: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 1' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 1: Tag, You're It!` },

  nodes: {
    ...baseScene.nodes,
    
    can9: {
      ...createCanNode(9, { x: Distance.centimeters(0), y: Distance.centimeters(0), z: Distance.centimeters(85.4) }),
      scriptIds: [ 'robotTouches' ]
    }
    
  }
  
};