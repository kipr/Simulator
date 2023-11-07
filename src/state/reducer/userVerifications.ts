import { UserVerifications } from "state/State";
import store from '..';
import construct from '../../util/construct';
import AccountAuthorization, { AsyncUserVerification, UserVerificationBrief } from "state/State/UserVerification";
import Async from "../State/Async";
import db from '../../db';
import Selector from '../../db/Selector';
import { errorToAsyncError } from "./util";
import { auth } from '../../firebase/firebase';
import Author from '../../db/Author';
import UserVerification from "state/State/UserVerification";






export namespace UserVerificationAction {

  export interface CreateUserVerification {
    type: 'user-verifications/create-user-verification';
    userId: string;
    userVerification: UserVerification;
  }

  export const createUserVerification = construct<CreateUserVerification>('user-verifications/create-user-verification');

  export interface SaveUserVerification {
    type: 'user-verifications/save-user-verification';
    userId: string;
  }

  export const saveUserVerification = construct<SaveUserVerification>('user-verifications/save-user-verification');

  export interface SetUserVerificationInternal {
    type: 'user-verifications/set-user-verification-internal';
    userId: string;
    userVerification: AsyncUserVerification;
  }

  export const setUserVerificationInternal = construct<SetUserVerificationInternal>('user-verifications/set-user-verification-internal');

  export interface LoadUserVerification {
    type: 'user-verifications/load-user-verification';
    userId: string;
  }

  export const loadUserVerification = construct<LoadUserVerification>('user-verifications/load-user-verification');


}


export type UserVerificationAction = (
  UserVerificationAction.CreateUserVerification |
  UserVerificationAction.SaveUserVerification |
  UserVerificationAction.SetUserVerificationInternal |
  UserVerificationAction.LoadUserVerification

);
const DEFAULT_USER_VERIFICATIONS: UserVerifications = {
};

const create = async (userId: string, next: Async.Creating<UserVerification>) => {
  try {
    await db.set(Selector.userVerification(userId), next.value);
    store.dispatch(UserVerificationAction.setUserVerificationInternal({
      userVerification: Async.loaded({
        brief: {},
        value: next.value
      }),
      userId,
    }));
  } catch (error) {
    store.dispatch(UserVerificationAction.setUserVerificationInternal({
      userVerification: Async.createFailed({
        value: next.value,
        error: errorToAsyncError(error),
      }),
      userId,
    }));
  }
};

const save = async (userId: string, current: Async.Saveable<UserVerificationBrief, UserVerification>) => {
  try {
    await db.set(Selector.userVerification(userId), current.value);

    const latest = Async.latestValue(store.getState().userVerification[userId]);

    let next: AsyncUserVerification;
    if (latest === current.value) {
      next = Async.loaded({
        brief: current.brief,
        value: current.value
      });
    } else {
      next = Async.saveable({
        brief: current.brief,
        original: current.value,
        value: latest,
      });
    }
    store.dispatch(UserVerificationAction.setUserVerificationInternal({
      userVerification: next,
      userId,
    }));
  } catch (error) {
    store.dispatch(UserVerificationAction.setUserVerificationInternal({
      userVerification: Async.saveFailed({
        brief: current.brief,
        original: current.original,
        value: current.value,
        error: errorToAsyncError(error),
      }),
      userId,
    }));
  }
};

const load = async (userId: string, current: AsyncUserVerification | undefined) => {
  const brief = Async.brief(current);
  try {
    const value = await db.get<UserVerification>(Selector.userVerification(userId));
    store.dispatch(UserVerificationAction.setUserVerificationInternal({
      userVerification: Async.loaded({ brief, value }),
      userId,
    }));
  } catch (error) {
    store.dispatch(UserVerificationAction.setUserVerificationInternal({
      userVerification: Async.loadFailed({ brief, error: errorToAsyncError(error) }),
      userId,
    }));
  }
};


export const reduceUserVerifications = (state: UserVerifications = DEFAULT_USER_VERIFICATIONS, action: UserVerificationAction): UserVerifications => {
  switch (action.type) {
    case 'user-verifications/load-user-verification': {
      void load(action.userId, state[action.userId]);
      return {
        ...state,
        [action.userId]: Async.loading({ brief: Async.brief(state[action.userId]) }),
      };
    }
    case 'user-verifications/create-user-verification': {
      const creating = Async.creating({ value: action.userVerification });
      void create(action.userId, creating);
      return {
        ...state,
        [action.userId]: creating,
      };
    }
    case 'user-verifications/set-user-verification-internal': return {
      ...state,
      [action.userId]: action.userVerification,
    };
    case 'user-verifications/save-user-verification': {
      const current = state[action.userId];
      if (current.type !== Async.Type.Saveable) return state;
      void save(action.userId, current);
      return {
        ...state,
        [action.userId]: Async.saving({
          brief: current.brief,
          original: current.original,
          value: current.value,
        }),
      };
    }
    default: return state;
  }
};