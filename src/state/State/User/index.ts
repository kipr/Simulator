export interface CurriculumAccess {
  /** A ISO 8601 timestamp of when the curriculum access begins. */
  startDate: string;
  /** A ISO 8601 timestamp of when the curriculum access ends. */
  endDate: string;
}

interface User {
  cirriculumAccess?: CurriculumAccess;
}

export default User;