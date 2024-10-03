import Assignment, { AssignmentBrief, AsyncAssignment } from '../State/Assignment';
import construct from '../../util/redux/construct';
import db from '../../db';
import { ASSIGNMENT_COLLECTION } from '../../db/constants';
import Dict from '../../util/objectOps/Dict';

import store from '../';
import Async from '../State/Async';
import { Assignments } from '../State';

export namespace AssignmentsAction {
  export interface SetAssignmentInternal {
    type: 'assignments/set-assignment-internal';
    id: string;
    assignment: AsyncAssignment;
  }

  export const setAssignmentInternal = construct<SetAssignmentInternal>('assignments/set-assignment-internal');

  export interface SetAssignmentsInternal {
    type: 'assignments/set-assignments-internal';
    assignments: Dict<AsyncAssignment>;
  }

  export const setAssignmentsInternal = construct<SetAssignmentsInternal>('assignments/set-assignments-internal');

  export interface ListAssignments {
    type: 'assignments/list-assignments';
    id: string;
  }

  export const listAssignments = construct<ListAssignments>('assignments/list-assignments');
}

export type AssignmentsAction = (
  AssignmentsAction.SetAssignmentInternal |
  AssignmentsAction.SetAssignmentsInternal |
  AssignmentsAction.ListAssignments
);

export const listAssignments = async () => {
  const assignments = await db.list<Assignment>(ASSIGNMENT_COLLECTION);
  store.dispatch(AssignmentsAction.setAssignmentsInternal({
    assignments: Dict.map(assignments, assignment => Async.loaded({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      brief: AssignmentBrief.fromAssignment(assignment),
      value: assignment
    }) as AsyncAssignment)
  }));
};
export const reduceAssignments = (state: Assignments = Assignments.TEST, action: AssignmentsAction): Assignments => {
  switch (action.type) {
    case 'assignments/set-assignment-internal': return {
      ...state,
      [action.id]: action.assignment,
    };
    case 'assignments/set-assignments-internal': {
      const newState = { ...state };
      for (const [id, a] of Object.entries(action.assignments)) newState[id] = a;
      return newState;
    }
    case 'assignments/list-assignments': {
      void listAssignments();
      return state;
    }
    default: return state;
  }
};