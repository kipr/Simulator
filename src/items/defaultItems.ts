import Item from './Item';
import Dict from '../Dict';

import * as Babylon from 'babylonjs';

export default {
  'Can1': {
    type: Item.Type.Can,
    startPosition: new Babylon.Vector3(-22, 5, -14.3),
    id: 'Can1',
  },

  'Can2': {
    type: Item.Type.Can,
    startPosition: new Babylon.Vector3(0, 5, -20.6),
    id: 'Can2',
  },

  'Can3': {
    type: Item.Type.Can,
    startPosition: new Babylon.Vector3(15.5, 5, -23.7),
    id: 'Can3',
  },

  'Can4': {
    type: Item.Type.Can,
    startPosition: new Babylon.Vector3(0, 5, -6.9),
    id: 'Can4',
  },

  'Can5': {
    type: Item.Type.Can,
    startPosition: new Babylon.Vector3(-13.7, 5, 6.8),
    id: 'Can5',
  },

  'Can6': {
    type: Item.Type.Can,
    startPosition: new Babylon.Vector3(0, 5, 6.8),
    id: 'Can6',
  },

  'Can7': {
    type: Item.Type.Can,
    startPosition: new Babylon.Vector3(13.5, 5, 6.8),
    id: 'Can7',
  },

  'Can8': {
    type: Item.Type.Can,
    startPosition: new Babylon.Vector3(25.1, 5, 14.8),
    id: 'Can8',
  },

  'Can9': {
    type: Item.Type.Can,
    startPosition: new Babylon.Vector3(0, 5, 34),
    id: 'Can9',
  },

  'Can10': {
    type: Item.Type.Can,
    startPosition: new Babylon.Vector3(-18.8, 5, 45.4),
    id: 'Can10',
  },

  'Can11': {
    type: Item.Type.Can,
    startPosition: new Babylon.Vector3(0, 5, 54.9),
    id: 'Can11',
  },

  'Can12': {
    type: Item.Type.Can,
    startPosition: new Babylon.Vector3(18.7, 5, 45.4),
    id: 'Can12',
  },

  'PaperReam1': {
    type: Item.Type.PaperReam,
    startPosition: new Babylon.Vector3(14, 1, 43.5),
    startRotation: Math.PI / 4,
    rotationAxis: Babylon.Axis.Y,
  }
} as Dict<Item>;