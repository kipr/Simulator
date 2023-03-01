import Patch from '../../src/util/Patch';
import Scene from '../../src/state/State/Scene';
import LocalizedString from '../../src/util/LocalizedString';
import Author from '../../src/db/Author';
import { Vector3 } from '../../src/unit-math';

const SCENE_A: Scene = {
  name: { [LocalizedString.EN_US]: 'Scene A' },
  description: { [LocalizedString.EN_US]: 'Scene A description' },
  author: Author.user('user'),
  camera: {
    type: 'none'
  },
  geometry: {},
  gravity: Vector3.meters(0, -9.8, 0),
  nodes: {
    '0': {
      type: 'object',
      geometryId: 'test',
      name: { [LocalizedString.EN_US]: 'Node 0' },
    },
    '1': {
      type: 'object',
      geometryId: 'test',
      name: { [LocalizedString.EN_US]: 'Node 1' },
    },
  }
};

const SCENE_B: Scene = {
  name: { [LocalizedString.EN_US]: 'Scene B' },
  description: { [LocalizedString.EN_US]: 'Scene B description' },
  author: Author.user('user'),
  camera: {
    type: 'none'
  },
  geometry: {},
  gravity: Vector3.meters(0, -9.8, 0),
  nodes: {
    '0': {
      type: 'object',
      geometryId: 'test1',
      name: { [LocalizedString.EN_US]: 'Node 0' },
    },
    '1': {
      type: 'from-template',
      name: { [LocalizedString.EN_US]: 'Node 1' },
      templateId: 'template',
    },
  }
};

describe('Patch', () => {
  it('should apply an outer diff', () => {
    const diff = Patch.diff({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 4 });
    expect(diff.type).toEqual(Patch.Type.OuterChange);
    const next = Patch.apply(diff, { a: 1, b: 2, c: 3 });
    expect(next).toEqual({ a: 1, b: 2, c: 4 });
  });
})