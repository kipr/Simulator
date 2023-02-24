import { Assignments } from '../State';
import { AsyncAssignment } from '../State/Assignment';
import construct from '../../util/construct';

export namespace AssignmentsAction {
  export interface SetAssignmentInternal {
    type: 'assignments/set-assignment-internal';
    id: string;
    assignment: AsyncAssignment;
  }

  export const setAssignmentInternal = construct<SetAssignmentInternal>('assignments/set-assignment-internal');
}

export type AssignmentsAction = (
  AssignmentsAction.SetAssignmentInternal
);

export const reduceAssignments = (state: Assignments = Assignments.TEST, action: AssignmentsAction): Assignments => {
  switch (action.type) {
    case 'assignments/set-assignment-internal': return {
      ...state,
      [action.id]: action.assignment,
    };
    default: return state;
  }
};