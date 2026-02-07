import { AsyncAssignment } from 'state/State/Assignment';
import { AsyncUser } from 'state/State/User';
import Async from '../state/State/Async';
import { AsyncChallenge } from '../state/State/Challenge';
import { AsyncChallengeCompletion } from '../state/State/ChallengeCompletion';
import { AsyncLimitedChallenge } from '../state/State/LimitedChallenge';
import { AsyncLimitedChallengeCompletion } from '../state/State/LimitedChallengeCompletion';
import { AsyncScene } from '../state/State/Scene';
import { CHALLENGE_COLLECTION, CHALLENGE_COMPLETION_COLLECTION, CLASSROOM_COLLECTION, SCENE_COLLECTION, LIMITED_CHALLENGE_COLLECTION, LIMITED_CHALLENGE_COMPLETION_COLLECTION, PROJECT_COLLECTION } from './constants';
import Selector from './Selector';
import LocalizedString from '../util/LocalizedString';
import { AsyncClassroom } from 'state/State/Classroom';
import { AsyncProject } from '../state/State/Project';

namespace Record {
  export enum Type {
    Scene = 'scene',
    Challenge = 'challenge',
    ChallengeCompletion = 'challenge-completion',
    User = 'user',
    Assignment = 'assignment',
    LimitedChallenge = 'limited-challenge',
    LimitedChallengeCompletion = 'limited-challenge-completion',
    Classroom = 'classroom',
    Project = 'project',
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

  export interface User extends Base<AsyncUser> {
    type: Type.User;
  }

  export interface Assignment extends Base<AsyncAssignment> {
    type: Type.Assignment;
  }

  export interface LimitedChallenge extends Base<AsyncLimitedChallenge> {
    type: Type.LimitedChallenge;
  }

  export interface LimitedChallengeCompletion extends Base<AsyncLimitedChallengeCompletion> {
    type: Type.LimitedChallengeCompletion;
  }

  export interface Classroom extends Base<AsyncClassroom> {
    type: Type.Classroom;
  }

  export interface Project extends Base<AsyncProject> {
    type: Type.Project;
  }

  export const selector = (record: Record): Selector => {
    switch (record.type) {
      case Type.Scene: return { collection: SCENE_COLLECTION, id: record.id };
      case Type.Challenge: return { collection: CHALLENGE_COLLECTION, id: record.id };
      case Type.ChallengeCompletion: return { collection: CHALLENGE_COMPLETION_COLLECTION, id: record.id };
      case Type.User: return { collection: 'users', id: record.id };
      case Type.Assignment: return { collection: 'assignments', id: record.id };
      case Type.LimitedChallenge: return { collection: LIMITED_CHALLENGE_COLLECTION, id: record.id };
      case Type.LimitedChallengeCompletion: return { collection: LIMITED_CHALLENGE_COMPLETION_COLLECTION, id: record.id };
      case Type.Classroom: return { collection: CLASSROOM_COLLECTION, id: record.id };
      case Type.Project: return { collection: PROJECT_COLLECTION, id: record.id };
    }
  };

  export const latestName = (record: Record) => {
    switch (record.type) {
      case Type.Scene: return Async.latestValue(record.value).name;
      case Type.Challenge: return Async.latestValue(record.value).name;
      case Type.ChallengeCompletion: return undefined;
      case Type.User: return { [LocalizedString.EN_US]: Async.latestValue(record.value).name };
      case Type.Assignment: return Async.latestValue(record.value).name;
      case Type.LimitedChallenge: return Async.latestValue(record.value).name;
      case Type.LimitedChallengeCompletion: return undefined;
      case Type.Classroom: return { [LocalizedString.EN_US]: Async.latestValue(record.value).classroomId };
      case Type.Project: return { [LocalizedString.EN_US]: Async.latestValue(record.value).projectId };
    }
  };

  export const latestDescription = (record: Record) => {
    switch (record.type) {
      case Type.Scene: return Async.latestValue(record.value).description;
      case Type.Challenge: return Async.latestValue(record.value).description;
      case Type.ChallengeCompletion: return undefined;
      case Type.User: return undefined;
      case Type.Assignment: return undefined;
      case Type.LimitedChallenge: return Async.latestValue(record.value).description;
      case Type.LimitedChallengeCompletion: return undefined;

    }
  };
}

type Record = (
  Record.Scene |
  Record.Challenge |
  Record.ChallengeCompletion |
  Record.User |
  Record.Assignment |
  Record.LimitedChallenge |
  Record.LimitedChallengeCompletion |
  Record.Classroom |
  Record.Project
);

export default Record;