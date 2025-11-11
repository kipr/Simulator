import LocalizedString from "../../../util/LocalizedString";
import Async from '../Async';
import tr from '@i18n';
import Dict from '../../../util/objectOps/Dict';

export interface Classroom {
  classroomId: string; // classroom ID
  code: LocalizedString; // invitation code
  studentIds: LocalizedString[];  // IDs of students in the classroom
  teacherId: string;  // ID of the teacher

}

export namespace Classroom {
  export const EMPTY: AsyncClassroom = {
    type: Async.Type.Loaded,
    value: {
      classroomId: '',
      code: tr(''),
      teacherId: '',
      studentIds: []
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


