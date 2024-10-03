import Async from '../Async';

export interface CurriculumAccess {
  /** A ISO 8601 timestamp of when the curriculum access begins. */
  startDate: string;
  /** A ISO 8601 timestamp of when the curriculum access ends. */
  endDate: string;
}

interface User {
  name?: string;
  cirriculumAccess?: CurriculumAccess;
  myAssignments?: string[];
}

namespace User {
  export const DEFAULT: User = {
    name: undefined,
    cirriculumAccess: undefined,
    myAssignments: undefined,
  };
}

export type UserBrief = Pick<User, 'name'>;

export type AsyncUser = Async<UserBrief, User>;

export default User;