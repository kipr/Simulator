
import Async from '../Async';
import Dict from '../../../util/objectOps/Dict';
import Scene from '../Scene';

export interface Classroom {
  classroomId: string; // classroom ID
  code: string; // invitation code
  studentIds: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>;  // IDs of students in the classroom
  teacherId: string;  // ID of the teacher
  teacherDisplayName: string; // Display name of the teacher
  type: 'classroom';
  docId?: string; // document ID in the database
  classroomAssignments?: Dict<ClassroomAssignment>; // assignments in the classroom, keyed by assignment ID
  topics?: Dict<string[]>; // topic name → assignment titles in that topic (derived from classroomAssignments when saving)
  /** Teacher per-student per-challenge point overrides: studentId → assignmentKey (docId or title) → sceneId → points */
  challengePointsOverrides?: Dict<Dict<Dict<number>>>;

  /** Teacher custom JBC snapshots shared with students via assignments (read-only for students). */
  sharedCustomChallenges?: Dict<ClassroomSharedCustomChallenge>;

}

export interface ClassroomSharedCustomChallenge {
  sceneId: string;
  scene: Scene;
  sharedByTeacherId: string;
  updatedAt: string;
}

export interface ClassroomAssignment {
  assignmentId: string;
  title: string;
  description?: string;
  points?: number | ''; // points can be a number or an empty string if not set
  dueDate?: string; // ISO string
  docId?: string; // assignment document ID in the database
  challenges?: Dict<{ challenge: ClassroomAssignmentChallenge, points: number | '' }>; // list of challenge IDs included in the assignment
  topic?: string; // topic of the assignment
  createdAt?: string; // ISO string of when the assignment was created
  editedAt?: string; // ISO string of when the assignment was last edited
  assignedTo?: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>; // mapping of student ID to boolean indicating whether the assignment is assigned to that student
}
//
export interface ClassroomAssignmentChallenge {
  sceneId: string;
  name: string;
  description: string;
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


