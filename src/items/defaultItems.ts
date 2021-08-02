import { Item } from '../state/State';
import Dict from '../Dict';

import * as Babylon from 'babylonjs';
import { Rotation, Vector3 } from '../unit-math';
import { AngleAxis as RawAngleAxis, Vector3 as RawVector3 } from '../math';
import { Distance } from '../util';

export default {
  'Can1': {
    type: Item.Type.Can,
    startingOrigin: {
      position: Vector3.fromRaw(RawVector3.create(-22, 5, -14.3), Distance.Type.Centimeters),
    },
    removable: false,
    name: 'Can 1',
  },
  'Can2': {
    type: Item.Type.Can,
    startingOrigin: {
      position: Vector3.fromRaw(RawVector3.create(0, 5, -20.6), Distance.Type.Centimeters),
    },
    removable: false,
    name: 'Can 2',
  },

  'Can3': {
    type: Item.Type.Can,
    startingOrigin: {
      position: Vector3.fromRaw(RawVector3.create(15.5, 5, -23.7), Distance.Type.Centimeters),
    },
    removable: false,
    name: 'Can 3',
  },

  'Can4': {
    type: Item.Type.Can,
    startingOrigin: {
      position: Vector3.fromRaw(RawVector3.create(0, 5, -6.9), Distance.Type.Centimeters),
    },
    removable: false,
    name: 'Can 4',
  },

  'Can5': {
    type: Item.Type.Can,
    startingOrigin: {
      position: Vector3.fromRaw(RawVector3.create(-13.7, 5, 6.8), Distance.Type.Centimeters),
    },
    removable: false,
    name: 'Can 5',
  },

  'Can6': {
    type: Item.Type.Can,
    startingOrigin: {
      position: Vector3.fromRaw(RawVector3.create(0, 5, 6.8), Distance.Type.Centimeters),
    },
    removable: false,
    name: 'Can 6',
  },
  'Can7': {
    type: Item.Type.Can,
    startingOrigin: {
      position: Vector3.fromRaw(RawVector3.create(13.5, 5, 6.8),  Distance.Type.Centimeters),
    },
    removable: false,
    name: 'Can 7',
  },

  'Can8': {
    type: Item.Type.Can,
    startingOrigin: {
      position: Vector3.fromRaw(RawVector3.create(25.1, 5, 14.8), Distance.Type.Centimeters),
    },
    removable: false,
    name: 'Can 8',
  },

  'Can9': {
    type: Item.Type.Can,
    startingOrigin: {
      position: Vector3.fromRaw(RawVector3.create(0, 5, 34), Distance.Type.Centimeters),
    },
    removable: false,
    name: 'Can 9',
  },

  'Can10': {
    type: Item.Type.Can,
    startingOrigin: {
      position: Vector3.fromRaw(RawVector3.create(-18.8, 5, 45.4), Distance.Type.Centimeters),
    },
    removable: false,
    name: 'Can 10',
  },

  'Can11': {
    type: Item.Type.Can,
    startingOrigin: {
      position: Vector3.fromRaw(RawVector3.create(0, 5, 54.9), Distance.Type.Centimeters),
    },
    removable: false,
    name: 'Can 11',
  },

  'Can12': {
    type: Item.Type.Can,
    startingOrigin: {
      position: Vector3.fromRaw(RawVector3.create(18.7, 5, 45.4), Distance.Type.Centimeters),
    },
    removable: false,
    name: 'Can 12',
  },

  'PaperReam1': {
    type: Item.Type.PaperReam,
    startingOrigin: {
      position: Vector3.fromRaw(RawVector3.create(14, 1, 43.5), Distance.Type.Centimeters),
      orientation: Rotation.AngleAxis.fromRaw(RawAngleAxis.create(Math.PI / 4, RawVector3.Y)),
    },
    removable: false,
    name: 'Paper Ream 1',
  }
} as Dict<Item>;