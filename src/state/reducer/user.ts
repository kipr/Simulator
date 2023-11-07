import User from "state/State/User";


export namespace UserAction {

  export interface SetUserId {
    type: "user/set-user-id";
    userId?: string;
  }

  export const setUserId = (userId?: string): SetUserId => ({
    type: "user/set-user-id",
    userId
  });
  export interface GetUserId {
    type: "user/get-user-id";
    userId?: string;
  }

  export const getUserId = (): GetUserId => ({
    type: "user/get-user-id",
    
  });
}

export type UserAction = (
  UserAction.SetUserId |
  UserAction.GetUserId
);

export const reduceUser = (state: User = {}, action: UserAction): User => {
  switch (action.type) {
    case "user/set-user-id": return {
      ...state,
      userId: action.userId
    };
    case "user/get-user-id": return {
      ...state,
      userId: state.userId
    };
    default: return state;
  }
};