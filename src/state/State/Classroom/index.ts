import LocalizedString from "../../../util/LocalizedString";
import Async from '../Async';
import tr from '@i18n';
import Dict from '../../../util/objectOps/Dict';

export interface Classroom {
  classroomId: string; // classroom ID
  code: string; // invitation code
  studentIds: Dict<{ id: string, displayName: string }>;  // IDs of students in the classroom
  teacherId: string;  // ID of the teacher
  teacherDisplayName: string; // Display name of the teacher
  type: 'classroom';
  docId?: string; // document ID in the database
  classroomAssignments?: Dict<ClassroomAssignment>; // assignments in the classroom, keyed by assignment ID

}

export interface ClassroomAssignment {
  assignmentId: string;
  title: string;
  description?: string;
  points?: number | ''; // points can be a number or an empty string if not set
  dueDate?: string; // ISO string
  docId?: string; // assignment document ID in the database
  challenges?: string[]; // list of challenge IDs included in the assignment
}

export namespace Classroom {
  export const EMPTY: AsyncClassroom = {
    type: Async.Type.Loaded,
    value: {
      classroomId: '',
      code: '',
      teacherId: '',
      teacherDisplayName: '',
      studentIds: {},
      docId: '',
      type: 'classroom',
    }
  };


}

export interface ClassroomBrief {
}

export namespace ClassroomBrief {
}


export type AsyncClassroom = Async<ClassroomBrief, Classroom>;

export namespace AsyncClassroom {
  export const unloaded = (brief: ClassroomBrief): AsyncClassroom => ({
    type: Async.Type.Unloaded,
    brief,

  });

  export const loaded = (classroom: Classroom): AsyncClassroom => ({
    type: Async.Type.Loaded,
    brief: {
    },
    value: classroom,
  });
}

export type Classrooms = Dict<AsyncClassroom>;


