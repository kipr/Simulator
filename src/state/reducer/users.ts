import { Users } from '../State';
import { AsyncUser } from '../State/User';
import construct from '../../util/construct';
import Async from '../State/Async';

export namespace UsersAction {
  export interface SetMe {
    type: 'users/set-me';
    me?: string;
  }

  export const setMe = construct<SetMe>('users/set-me');

  export interface SetUserInternal {
    type: 'users/set-user-internal';
    id: string;
    user: AsyncUser;
  }

  export const setUserInternal = construct<SetUserInternal>('users/set-user-internal');

  export interface AddMyAssignment {
    type: 'users/add-my-assignment';
    userId: string;
    assignmentId: string;
  }

  export const addMyAssignment = construct<AddMyAssignment>('users/add-my-assignment');

  export interface RemoveMyAssignment {
    type: 'users/remove-my-assignment';
    userId: string;
    assignmentId: string;
  }

  export const removeMyAssignment = construct<RemoveMyAssignment>('users/remove-my-assignment');

  export interface SetMyAssignments {
    type: 'users/set-my-assignments';
    userId: string;
    assignmentIds: string[];
  }

  export const setMyAssignments = construct<SetMyAssignments>('users/set-my-assignments');
}

export type UsersAction = (
  UsersAction.SetMe |
  UsersAction.SetUserInternal |
  UsersAction.AddMyAssignment |
  UsersAction.RemoveMyAssignment |
  UsersAction.SetMyAssignments
);

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
        [action.id]: action.user,
      },
    };
    case 'users/add-my-assignment': return {
      ...state,
      users: {
        ...state.users,
        [action.userId]: Async.mutate(state.users[action.userId], user => {
          if (!user.myAssignments) user.myAssignments = [];
          user.myAssignments.push(action.assignmentId);
        }),
      },
    };
    case 'users/remove-my-assignment': return {
      ...state,
      users: {
        ...state.users,
        [action.userId]: Async.mutate(state.users[action.userId], user => {
          if (!user.myAssignments) return;
          user.myAssignments = user.myAssignments.filter(id => id !== action.assignmentId);
        }),
      },
    };
    case 'users/set-my-assignments': return {
      ...state,
      users: {
        ...state.users,
        [action.userId]: Async.mutate(state.users[action.userId], user => {
          user.myAssignments = action.assignmentIds;
        }),
      },
    };
    default: return state;
  }
}