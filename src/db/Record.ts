import Async from '../state/State/Async';
import { AsyncChallenge } from '../state/State/Challenge';
import { AsyncChallengeCompletion } from '../state/State/ChallengeCompletion';
import { AsyncScene } from '../state/State/Scene';
import { CHALLENGE_COLLECTION, CHALLENGE_COMPLETION_COLLECTION, SCENE_COLLECTION } from './constants';
import Selector from './Selector';

namespace Record {
  export enum Type {
    Scene = 'scene',
    Challenge = 'challenge',
    ChallengeCompletion = 'challenge-completion',
  }

  interface Base<T> {
    id: string;
    value: T;
  }

  export interface Scene extends Base<AsyncScene> {
    type: Type.Scene;
  }

  export interface Challenge extends Base<AsyncChallenge> {
    type: Type.Challenge;
  }

  export interface ChallengeCompletion extends Base<AsyncChallengeCompletion> {
    type: Type.ChallengeCompletion;
  }

  export const selector = (record: Record): Selector => {
    switch (record.type) {
      case Type.Scene: return { collection: SCENE_COLLECTION, id: record.id };
      case Type.Challenge: return { collection: CHALLENGE_COLLECTION, id: record.id };
      case Type.ChallengeCompletion: return { collection: CHALLENGE_COMPLETION_COLLECTION, id: record.id };
    }
  };

  export const latestName = (record: Record) => {
    switch (record.type) {
      case Type.Scene: return Async.latestValue(record.value).name;
      case Type.Challenge: return Async.latestValue(record.value).name;
      case Type.ChallengeCompletion: return undefined;
    }
  };

  export const latestDescription = (record: Record) => {
    switch (record.type) {
      case Type.Scene: return Async.latestValue(record.value).description;
      case Type.Challenge: return Async.latestValue(record.value).description;
      case Type.ChallengeCompletion: return undefined;
    }
  };
}

type Record = (
  Record.Scene |
  Record.Challenge |
  Record.ChallengeCompletion
);

export default Record;