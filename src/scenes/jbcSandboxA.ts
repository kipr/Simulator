import Scene from "../state/State/Scene";
import { Rotation } from "../unit-math";
import { Distance } from "../util";

import { createCanNode, createBaseSceneSurfaceA } from './jbcBase';

const baseScene = createBaseSceneSurfaceA();

export const JBC_Sandbox_A: Scene = {
  ...baseScene,
  name: 'JBC Sandbox A',
  description: `Junior Botball Challenge Sandbox on Mat A. All cans 1-12 are available by default.`,
  nodes: {
    ...baseScene.nodes,
    'can1': createCanNode(1, undefined, true, false),
    'can2': createCanNode(2, undefined, true, false),
    'can3': createCanNode(3, undefined, true, false),
    'can4': createCanNode(4, undefined, true, false),
    'can5': createCanNode(5, undefined, true, false),
    'can6': createCanNode(6, undefined, true, false),
    'can7': createCanNode(7, undefined, true, false),
    'can8': createCanNode(8, undefined, true, false),
    'can9': createCanNode(9, undefined, true, false),
    'can10': createCanNode(10, undefined, true, false),
    'can11': createCanNode(11, undefined, true, false),
    'can12': createCanNode(12, undefined, true, false),
    'ream1': {
      type: 'from-template',
      templateId: 'ream',
      name: 'Paper Ream 1',
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(5),
          z: Distance.centimeters(67.5),
        },
        orientation: Rotation.AngleAxis.fromRaw({
          axis: { x: 1, y: 0, z: 0 },
          angle: -Math.PI / 2,
        }),
      },
      editable: true,
      visible: false,
    },
    'ream2': {
      type: 'from-template',
      templateId: 'ream',
      name: 'Paper Ream 2',
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(5),
          z: Distance.centimeters(-6.3),
        },
        orientation: Rotation.AngleAxis.fromRaw({
          axis: { x: 1, y: 0, z: 0 },
          angle: -Math.PI / 2,
        }),
      },
      editable: true,
      visible: false,
    },
  }
};