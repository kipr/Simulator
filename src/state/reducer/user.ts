import User from 'state/State/User';

export namespace UserAction {
  export interface SetUserId {
    type: "user/set-user-id";
    userId?: string;
  }

  export const setUserId = (userId?: string): SetUserId => ({
    type: "user/set-user-id",
    userId
  });
}

export type UserAction = (
  UserAction.SetUserId
);

export const reduceUser = (state: User = {}, action: UserAction): User => {
  switch (action.type) {
    case "user/set-user-id": return {
      ...state,
      userId: action.userId
    };
    default: return state;
  }
};