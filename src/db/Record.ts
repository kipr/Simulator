import Async from '../state/State/Async';
import { AsyncScene } from '../state/State/Scene';
import LocalizedString from '../util/LocalizedString';
import { SCENE_COLLECTION } from './constants';
import Selector from './Selector';

namespace Record {
  export enum Type {
    Scene = 'scene',
  }

  interface Base<T> {
    id: string;
    value: T;
  }

  export interface Scene extends Base<AsyncScene> {
    type: Type.Scene;
  }

  export const selector = (record: Record): Selector => {
    switch (record.type) {
      case Type.Scene: return { collection: SCENE_COLLECTION, id: record.id };
    }
  };

  export const latestName = (record: Record) => Async.latestValue(record.value).name;
  export const latestDescription = (record: Record) => Async.latestValue(record.value).description;
}

type Record = Record.Scene;

export default Record;