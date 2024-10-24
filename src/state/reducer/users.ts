import { Users } from '../State';
import User, { AsyncUser, UserBrief } from '../State/User';
import construct from '../../util/redux/construct';
import Async from '../State/Async';
import db from '../../db';
import Selector from '../../db/Selector';
import store from '../';
import { AutoSaver, errorToAsyncError } from './util';

export namespace UsersAction {
  export interface SetMe {
    type: 'users/set-me';
    me?: string;
  }

  export const setMe = construct<SetMe>('users/set-me');

  export interface SetUserInternal {
    type: 'users/set-user-internal';
    userId: string;
    user: AsyncUser;
  }

  export const setUserInternal = construct<SetUserInternal>('users/set-user-internal');

  export interface AddMyAssignment {
    type: 'users/add-my-assignment';
    assignmentId: string;
  }

  export const addMyAssignment = construct<AddMyAssignment>('users/add-my-assignment');

  export interface RemoveMyAssignment {
    type: 'users/remove-my-assignment';
    assignmentId: string;
  }

  export const removeMyAssignment = construct<RemoveMyAssignment>('users/remove-my-assignment');

  export interface SetMyAssignments {
    type: 'users/set-my-assignments';
    assignmentIds: string[];
  }

  export const setMyAssignments = construct<SetMyAssignments>('users/set-my-assignments');

  export interface SyncMe {
    type: 'users/sync-me';
  }

  export const SYNC_ME: SyncMe = { type: 'users/sync-me' };

  export interface LoadUser {
    type: 'users/load-user';
    userId: string;
  }

  export const loadUser = construct<LoadUser>('users/load-user');

  export interface LoadOrEmptyUser {
    type: 'users/load-or-empty-user';
    userId: string;
  }

  export const loadOrEmptyUser = construct<LoadOrEmptyUser>('users/load-or-empty-user');
}

export type UsersAction = (
  UsersAction.SetMe |
  UsersAction.SetUserInternal |
  UsersAction.AddMyAssignment |
  UsersAction.RemoveMyAssignment |
  UsersAction.SetMyAssignments |
  UsersAction.SyncMe |
  UsersAction.LoadUser |
  UsersAction.LoadOrEmptyUser
);

const sync = async (userId: string, current: Async.Saveable<UserBrief, User>) => {
  try {
    await db.set(Selector.user(userId), current.value);
    store.dispatch(UsersAction.setUserInternal({
      user: Async.loaded({
        brief: current.brief,
        value: current.value
      }),
      userId,
    }));
  } catch (error) {
    store.dispatch(UsersAction.setUserInternal({
      user: Async.saveFailed({
        brief: current.brief,
        original: current.original,
        value: current.value,
        error: errorToAsyncError(error),
      }),
      userId,
    }));
  }
};

const load = async (userId: string, current: AsyncUser | undefined) => {
  const brief = Async.brief(current);
  try {
    const value = await db.get<User>(Selector.user(userId));
    store.dispatch(UsersAction.setUserInternal({
      user: Async.loaded({ brief, value }),
      userId,
    }));
  } catch (error) {
    store.dispatch(UsersAction.setUserInternal({
      user: Async.loadFailed({ brief, error: errorToAsyncError(error) }),
      userId,
    }));
  }
};

const loadOrEmpty = async (userId: string, current: AsyncUser | undefined) => {
  const brief = Async.brief(current);
  try {
    const value = await db.get<User>(Selector.user(userId));
    store.dispatch(UsersAction.setUserInternal({
      user: Async.loaded({ brief, value }),
      userId,
    }));
  } catch (error) {
    const err = errorToAsyncError(error);
    if (err.code === 404) {
      store.dispatch(UsersAction.setUserInternal({
        user: Async.saveable({ brief, original: User.DEFAULT, value: User.DEFAULT }),
        userId,
      }));
    } else {
      store.dispatch(UsersAction.setUserInternal({
        user: Async.loadFailed({ brief, error: err }),
        userId,
      }));
    }
  }
};

const syncAll = async () => {
  const state = store.getState();
  for (const userId in state.users.users) {
    const user = state.users.users[userId];
    if (user.type !== Async.Type.Saveable) continue;
    await sync(userId, user);
  }
};

const autoSaver = new AutoSaver(1000, syncAll);

export const reduceUsers = (state: Users = Users.EMPTY, action: UsersAction): Users => {
  switch (action.type) {
    case 'users/set-me': return {
      ...state,
      me: action.me,
    };
    case 'users/set-user-internal': return {
      ...state,
      users: {
        ...state.users,
        [action.userId]: action.user,
      },
    };
    case 'users/add-my-assignment': {
      autoSaver.touch();
      return {
        ...state,
        users: {
          ...state.users,
          [state.me]: Async.mutate(state.users[state.me], user => {
            if (!user.myAssignments) user.myAssignments = [];
            user.myAssignments.push(action.assignmentId);
          }),
        },
      };
    }
    case 'users/remove-my-assignment': {
      autoSaver.touch();
      return {
        ...state,
        users: {
          ...state.users,
          [state.me]: Async.mutate(state.users[state.me], user => {
            if (!user.myAssignments) return;
            user.myAssignments = user.myAssignments.filter(id => id !== action.assignmentId);
          }),
        },
      };
    }
    case 'users/set-my-assignments': {
      autoSaver.touch();
      return {
        ...state,
        users: {
          ...state.users,
          [state.me]: Async.mutate(state.users[state.me], user => {
            user.myAssignments = action.assignmentIds;
          }),
        },
      };
    }
    case 'users/sync-me': {
      const userId = state.me;
      if (!userId) return state;

      const current = state.users[userId];
      if (current.type !== Async.Type.Saveable) return;

      void sync(userId, current);

      return {
        ...state,
        users: {
          ...state.users,
          [userId]: Async.saving(current),
        },
      };
    }
    case 'users/load-user': {
      const userId = action.userId;
      const current = state.users[userId];

      void load(userId, current);

      return {
        ...state,
        users: {
          ...state.users,
          [userId]: Async.loading({
            brief: Async.brief(current),
          }),
        },
      };
    }
    case 'users/load-or-empty-user': {
      const userId = action.userId;
      const current = state.users[userId];

      void loadOrEmpty(userId, current);

      return {
        ...state,
        users: {
          ...state.users,
          [userId]: Async.loading({
            brief: Async.brief(current),
          }),
        },
      };
    }
    default: return state;
  }
};