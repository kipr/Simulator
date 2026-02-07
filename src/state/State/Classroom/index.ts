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
  docId?: string; // document ID in the database
  type: 'classroom';


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


