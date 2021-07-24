import { Item } from '../state';
import Dict from '../Dict';

import * as Babylon from 'babylonjs';
import { AngleAxis, Quaternion, Vector3 } from '../math';

export default {
  'Can1': {
    type: Item.Type.Can,
    origin: {
      position: Vector3.create(-22, 5, -14.3),
    },
    name: 'Can1',
  },
  'Can2': {
    type: Item.Type.Can,
    origin: {
      position: Vector3.create(0, 5, -20.6),
    },
    name: 'Can2',
  },

  'Can3': {
    type: Item.Type.Can,
    origin: {
      position: Vector3.create(15.5, 5, -23.7),
    },
    name: 'Can3',
  },

  'Can4': {
    type: Item.Type.Can,
    origin: {
      position: Vector3.create(0, 5, -6.9),
    },
    name: 'Can4',
  },

  'Can5': {
    type: Item.Type.Can,
    origin: {
      position: Vector3.create(-13.7, 5, 6.8),
    },
    name: 'Can5',
  },

  'Can6': {
    type: Item.Type.Can,
    origin: {
      position: Vector3.create(0, 5, 6.8),
    },
    name: 'Can6',
  },
  'Can7': {
    type: Item.Type.Can,
    origin: {
      position: Vector3.create(13.5, 5, 6.8),
    },
    name: 'Can7',
  },

  'Can8': {
    type: Item.Type.Can,
    origin: {
      position: Vector3.create(25.1, 5, 14.8),
    },
    name: 'Can8',
  },

  'Can9': {
    type: Item.Type.Can,
    origin: {
      position: Vector3.create(0, 5, 34),
    },
    name: 'Can9',
  },

  'Can10': {
    type: Item.Type.Can,
    origin: {
      position: Vector3.create(-18.8, 5, 45.4),
    },
    name: 'Can10',
  },

  'Can11': {
    type: Item.Type.Can,
    startPosition: new Babylon.Vector3(0, 5, 54.9),
    origin: {
      position: Vector3.create(0, 5, 54.9),
    },
    name: 'Can11',
  },

  'Can12': {
    type: Item.Type.Can,
    origin: {
      position: Vector3.create(18.7, 5, 45.4),
    },
    name: 'Can12',
  },

  'PaperReam1': {
    type: Item.Type.PaperReam,
    origin: {
      position: Vector3.create(14, 1, 43.5),
      orientation: AngleAxis.toQuaternion(AngleAxis.create(Math.PI / 4, Vector3.Y)),
    },
    name: 'PaperReam1',
  }
} as Dict<Item>;