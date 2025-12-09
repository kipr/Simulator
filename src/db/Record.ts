import { AsyncAssignment } from 'state/State/Assignment';
import { AsyncUser } from 'state/State/User';
import Async from '../state/State/Async';
import { AsyncChallenge } from '../state/State/Challenge';
import { AsyncChallengeCompletion } from '../state/State/ChallengeCompletion';
import { AsyncScene } from '../state/State/Scene';
import { CHALLENGE_COLLECTION, CHALLENGE_COMPLETION_COLLECTION, CLASSROOM_COLLECTION, SCENE_COLLECTION, PROJECT_COLLECTION } from './constants';
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

    }
  };
}

type Record = (
  Record.Scene |
  Record.Challenge |
  Record.ChallengeCompletion |
  Record.User |
  Record.Assignment |
  Record.Classroom |
  Record.Project
);

export default Record;