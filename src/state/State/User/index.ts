import Async from "../Async";

 interface User {
    userId?: string;
}

export interface UserBrief{
  
}

export namespace UserBrief{

}
  
export type AsyncUser = Async<UserBrief, User>;

export namespace AsyncUser{
    export const unloaded = (brief: UserBrief): AsyncUser => ({
        type: Async.Type.Unloaded,
        brief,
      });
    
      export const loaded = (user: User): AsyncUser => ({
        type: Async.Type.Loaded,
        brief: {
         
        },
        value: user,
      });
}


export default User;