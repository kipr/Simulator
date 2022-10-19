// This scene is for testing purposes and not currently exposed in the UI

import Scene from "../state/State/Scene";
import Camera from "../state/State/Scene/Camera";
import { Distance, Mass } from "../util";
import LocalizedString from '../util/LocalizedString';

export const TEST_SCENE: Scene = {
  name: { [LocalizedString.EN_US]: 'Test' },
  description: { [LocalizedString.EN_US]: 'A test scene, including an arena' },
  authorId: 'Braden',
  geometry: {
    'box': {
      type: 'box',
      size: {
        x: Distance.centimeters(5),
        y: Distance.centimeters(5),
        z: Distance.centimeters(5),
      }
    },
    'table': {
      type: 'file',
      uri: 'static/arena.glb'
    },
    'jbc_mat': {
      type: 'file',
      uri: 'static/jbcMatA.glb'
    },
  },
  nodes: {
    'table': {
      type: 'object',
      geometryId: 'table',
      name: { [LocalizedString.EN_US]: 'A Table' },
      origin: {
        scale: {
          x: 30,
          y: 30,
          z: 30,
        }
      },
      physics: {
        type: 'mesh',
        restitution: 0,
        friction: 1
      },
      visible: true,
    },
    'jbc_mat': {
      type: 'object',
      geometryId: 'jbc_mat',
      name: { [LocalizedString.EN_US]: 'JBC Surface A' },
      origin: {
        position: {
          x: Distance.meters(0),
          y: Distance.meters(1.02),
          z: Distance.meters(0),
        },
        scale: {
          x: 70,
          y: 70,
          z: 70,
        }
      },
      visible: true,
      physics: {
        type: 'box',
        restitution: 0,
        friction: 1
      },
    },
    'box0': {
      type: 'object',
      geometryId: 'box',
      name: { [LocalizedString.EN_US]: 'box0' },
      origin: {
        position: {
          x: Distance.meters(0.5),
          y: Distance.meters(1.5),
          z: Distance.meters(0),
        },
      },
      editable: true,
      visible: true,
      physics: {
        type: 'box',
        mass: Mass.grams(100),
        friction: 0.7,
        restitution: 0.3,
      }
    },
    'light0': {
      type: 'point-light',
      intensity: 10000,
      name: { [LocalizedString.EN_US]: 'Light' },
      origin: {
        position: {
          x: Distance.meters(0),
          y: Distance.meters(2.00),
          z: Distance.meters(0),
        },
      },
      visible: true
    },
  },
  camera: Camera.arcRotate({
    radius: Distance.meters(5),
    target: {
      x: Distance.meters(0),
      y: Distance.meters(1.1),
      z: Distance.meters(0),
    },
    position: {
      x: Distance.meters(2),
      y: Distance.meters(2),
      z: Distance.meters(2),
    }
  }),
  gravity: {
    x: Distance.meters(0),
    y: Distance.meters(-9.8 / 2),
    z: Distance.meters(0),
  }
};