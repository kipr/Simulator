import Scene from "../../../../state/State/Scene";
import { Distance } from "../../../../util";
import LocalizedString from '../../../../util/LocalizedString';
import { Color } from '../../../../state/State/Scene/Color';
import { createBaseSceneSurfaceB, createCanNode } from '../jbcBase';

const baseScene = createBaseSceneSurfaceB();

export const JBC_10B: Scene = {
  ...baseScene,
  name: { [LocalizedString.EN_US]: 'JBC 10B' },
  description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 10: Solo Joust Jr.' },
  nodes: {
    ...baseScene.nodes,
    mainSurface: {
      type: 'object',
      geometryId: 'mainSurface_geom',
      name: { [LocalizedString.EN_US]: 'Mat Surface' },
      visible: false,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.75),
        },
      },
      material: {
        type: 'basic',
        color: {
          type: 'color3',
          color: Color.rgb(0, 0, 0),
        },
      },
    },
    startBox: {
      type: 'object',
      geometryId: 'startBox_geom',
      name: { [LocalizedString.EN_US]: 'Start Box' },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(-90),
          y: Distance.centimeters(-6.9),
          z: Distance.centimeters(-3),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    lineB: {
      type: 'object',
      geometryId: 'lineB_geom',
      name: { [LocalizedString.EN_US]: 'Line B' },
      visible: true,
      origin: {
        position: {
          x: Distance.centimeters(0),
          y: Distance.centimeters(-6.9),
          z: Distance.inches(19.75),
        },
      },
      material: {
        type: 'pbr',
        emissive: {
          type: 'color3',
          color: Color.rgb(255, 255, 255),
        },
      },
    },
    'can1': createCanNode(1, { x: Distance.centimeters(-13), y: Distance.centimeters(0), z: Distance.centimeters(17) }), // green line
    'can2': createCanNode(2, { x: Distance.centimeters(-17), y: Distance.centimeters(0), z: Distance.centimeters(41) }), // red line
    'can3': createCanNode(3, { x: Distance.centimeters(11.5), y: Distance.centimeters(0), z: Distance.centimeters(51) }), // yellow line
    'can4': createCanNode(4, { x: Distance.centimeters(10.5), y: Distance.centimeters(0), z: Distance.centimeters(23) }), // purple line
  }
};