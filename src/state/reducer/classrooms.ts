import store from '..';
import { AsyncClassroom, ClassroomBrief, Classroom, ClassroomAssignment } from '../State/Classroom';
import Async from '../State/Async';
import Dict from '../../util/objectOps/Dict';
import Selector from '../../db/Selector';
import db from '../../db';
import { errorToAsyncError } from './util';
import construct from '../../util/redux/construct';
import ChallengeCompletion from 'state/State/ChallengeCompletion';

export namespace ClassroomsAction {

  export const setClassroomInternal = construct<SetClassroomInternal>('classrooms/set-classroom-internal');

  export interface SetClassroomInternal {
    type: 'classrooms/set-classroom-internal';
    classroomId: string;
    classroom: AsyncClassroom;
  }

  export interface LoadClassroom {
    type: 'classrooms/load-classroom';
    classroomId: string;
  }

  export const loadClassroom = construct<LoadClassroom>('classrooms/load-classroom');

  export interface ShowClassroomLeaderboard {
    type: 'classrooms/show-classroom-leaderboard';
    classroom: AsyncClassroom;
  }
  export const showClassroomLeaderboard = construct<ShowClassroomLeaderboard>('classrooms/show-classroom-leaderboard');

  export interface SetClassroom {
    type: 'classrooms/set-classroom';
    classroomId: string;
    classroom: AsyncClassroom;
  }

  export const setClassroom = construct<SetClassroom>('classrooms/set-classroom');

  export interface SetClassrooms {
    type: 'classrooms/set-classrooms';
    classrooms: Dict<AsyncClassroom>;
  }

  export const setClassrooms = construct<SetClassrooms>('classrooms/set-classrooms');

  export interface CreateClassroom {
    type: 'classrooms/create-classroom';
    classroom: Classroom;
  }

  export const createClassroom = construct<CreateClassroom>('classrooms/create-classroom');

  export interface ListOwnedClassrooms {
    type: 'classrooms/list-owned-classrooms';

  }

  export const deleteClassroom = construct<DeleteClassroom>('classrooms/delete-classroom');
  export interface DeleteClassroom {
    type: 'classrooms/delete-classroom';
    classroomId: string;
    classroom: Classroom;
  }

  export const listOwnedClassrooms = construct<ListOwnedClassrooms>('classrooms/list-owned-classrooms');

  export interface ListChallengesByStudentId {
    type: 'classrooms/list-challenges-by-student-id';
    studentId: string;
  }

  export const listChallengesByStudentId = construct<ListChallengesByStudentId>('classrooms/list-challenges-by-student-id');

  export interface StudentAdded {
    type: 'classrooms/student-added';
    classroomId: string;
    studentId: string;
    displayName: string;
  }

  export const studentAdded = construct<StudentAdded>('classrooms/student-added');

  export interface JoinClassroom {
    type: 'classrooms/join-classroom';
    classroom: Classroom;
  }

  export const joinClassroom = construct<JoinClassroom>('classrooms/join-classroom');
  export interface RemoveStudentFromClassroom {
    type: 'classrooms/remove-student-from-classroom';
    studentId: string;
    currentClassroom: Classroom;

  }

  export const removeStudentFromClassroom = construct<RemoveStudentFromClassroom>('classrooms/remove-student-from-classroom');

  export interface StudentInClassroom {
    type: 'classrooms/student-in-classroom';
    studentId: string;
  }

  export const studentInClassroom = construct<StudentInClassroom>('classrooms/student-in-classroom');

  export interface FindClassroomByInviteCode {
    type: 'classrooms/find-classroom-by-invite-code';
    inviteCode: string;
  }

  export const findClassroomByInviteCode = construct<FindClassroomByInviteCode>('classrooms/find-classroom-by-invite-code');

  export interface ClearSelectedClassroom {
    type: 'classrooms/clear-selected-classroom';
  }

  export const clearSelectedClassroom = construct<ClearSelectedClassroom>('classrooms/clear-selected-classroom');

  export interface SetAssignment {
    type: 'classrooms/set-assignment';
    classroom: Classroom;
    assignment: ClassroomAssignment;
    studentIds: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>;
  }

  export const setAssignment = construct<SetAssignment>('classrooms/set-assignment');

  export interface GetAssignments {
    type: 'classrooms/get-assignments';
    classroomDocId: string;

  }

  export const getAssignments = construct<GetAssignments>('classrooms/get-assignments');

  export interface AddClassroomTopic {
    type: 'classrooms/add-classroom-topic';
    classroomDocId: string;
    topic: string;
  }

  export const addClassroomTopic = construct<AddClassroomTopic>('classrooms/add-classroom-topic');
}

export type ClassroomsAction =
  | ClassroomsAction.LoadClassroom
  | ClassroomsAction.CreateClassroom
  | ClassroomsAction.SetClassroom
  | ClassroomsAction.SetClassrooms
  | ClassroomsAction.StudentAdded
  | ClassroomsAction.RemoveStudentFromClassroom
  | ClassroomsAction.StudentInClassroom
  | ClassroomsAction.FindClassroomByInviteCode
  | ClassroomsAction.ListOwnedClassrooms
  | ClassroomsAction.ShowClassroomLeaderboard
  | ClassroomsAction.ClearSelectedClassroom
  | ClassroomsAction.SetClassroomInternal
  | ClassroomsAction.DeleteClassroom
  | ClassroomsAction.JoinClassroom
  | ClassroomsAction.ListChallengesByStudentId
  | ClassroomsAction.SetAssignment
  | ClassroomsAction.GetAssignments
  | ClassroomsAction.AddClassroomTopic;

const load = async (
  classroomId: string,
  current: AsyncClassroom | undefined
) => {
  const brief = Async.brief(current);
  try {
    const value = await db.get<Classroom>(Selector.classroom(classroomId));
    store.dispatch(
      ClassroomsAction.setClassroom({
        classroom: Async.loaded({ brief, value }),
        classroomId,
      })
    );
  } catch (error) {
    store.dispatch(
      ClassroomsAction.setClassroom({
        classroomId,
        classroom: Async.loadFailed({ brief, error: errorToAsyncError(error) }),
      })
    );
  }
};

// 6 character unique ID generator
const generateUniqueClassroomId = async (): Promise<string> => {
  let uniqueId: string;
  let shortenedId: string;
  let exists = true;

  while (exists) {
    const uuid = crypto.randomUUID();
    shortenedId = uuid.replace(/-/g, '').slice(-7);

    try {
      const classroom = await db.get<Classroom>(Selector.classroom(shortenedId));
      exists = !!classroom; // if we got data, it exists
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null) {
        const e = err as { code?: unknown; message?: unknown };

        const code = typeof e.code === "number" ? e.code : undefined;
        const message = typeof e.message === "string" ? e.message : undefined;

        if (code === 404 || (message?.includes("Not found") ?? false)) {
          exists = false;
          continue;
        }
      }

      console.error("Unexpected DB error while checking ID:", err);
      throw err;
    }
  }

  return shortenedId;
};


// Create classroom in database and update store
const create = async (next: Async.Creating<Classroom>) => {
  const generatedId = await generateUniqueClassroomId();
  try {
    // Write directly to your database (Firestore or local DB)
    next.value.docId = generatedId;
    await db.set(Selector.classroom(generatedId), next.value);
    // Update Redux or local store
    store.dispatch(
      ClassroomsAction.setClassrooms({
        classrooms: {
          [generatedId]: Async.loaded({
            brief: {},
            value: next.value,
          })
        }
      })
    );

  } catch (error) {
    console.error('Error creating classroom:', error);
  }
};

// Delete classroom from database and update store
export const deleteClassroom = async (classroomId: string, next: Async.Deleting<ClassroomBrief, Classroom>) => {
  try {
    await db.delete(Selector.classroom(classroomId));

    store.dispatch(
      ClassroomsAction.deleteClassroom({
        classroomId,
        classroom: next.value,
      })
    );

  } catch (error) {
    console.error('Error deleting classroom:', error);
  }
};


// List classrooms owned by logged-in user and update store
const listOwned = async () => {
  try {
    const result = await db.list<Classroom>('classrooms');
    console.log("Raw classrooms result from DB: ", result);

    const classrooms: Dict<AsyncClassroom> = {};
    Object.entries(result).forEach(([id, classroom]) => {
      classrooms[id] = Async.loaded({ brief: {}, value: classroom });
    });
    console.log("Owned classrooms: ", classrooms);
    store.dispatch(ClassroomsAction.setClassrooms({ classrooms }));

  } catch (error) {
    console.error('Failed to list classrooms', error);
  }
};


// List challenge completions for a specific student ID
export const listChallengesByStudentId = async (studentId: string) => {
  try {
    const result = await db.list<ChallengeCompletion>(`classrooms/${studentId}/challenges`);
    return result;
  } catch (error) {
    console.error('Failed to list challenge completions', error);
    return {};
  }

};
type ChallengeEntry = { id: string; data: Record<string, unknown> };

// Get all challenges by all students in a classroom
export const getAllStudentsClassroomChallenges = async (classroom: Classroom) => {
  try {
    const params = new URLSearchParams();
    const mappedStudentChallenge = {};
    for (const student of Object.values(classroom.studentIds)) {
      const normalizedId = typeof student.id === 'string' ? student.id : student.id['en-US'];
      params.append('studentId', normalizedId);
    }
    const result = await db.list(`classrooms/challenges?${params.toString()}`);

    for (const student of Object.values(classroom.studentIds)) {
      const studentId =
        typeof student.id === 'string' ? student.id : student.id['en-US'];

      const displayName =
        typeof student.displayName === 'string'
          ? student.displayName
          : student.displayName['en-US'];

      const entries = result[studentId];
      if (!entries) continue;

      const mappedByEntryId: Record<string, unknown> = {};

      for (const challenge of entries as ChallengeEntry[]) {
        mappedByEntryId[challenge.id] = challenge.data;
      }
      mappedStudentChallenge[displayName] = { displayName: displayName, uid: studentId, challenges: mappedByEntryId };
    }

    return mappedStudentChallenge;

  } catch (error) {
    console.error('Failed to get all challenges by all students in classroom');
    return {};
  }
};


// Add student to classroom in database and update store (internal)
export async function addStudentToClassroomAsyncRaw(
  returnedClassroom: Classroom,
  inviteCode: string,
  studentId: string,
  displayName: string
): Promise<Classroom | null> {

  const foundClassroom = returnedClassroom;
  if (!foundClassroom) return null;

  const normalized = studentId;

  const studentEntry = {
    id: studentId,
    displayName: displayName
  };
  const docId = foundClassroom.docId;

  const updatedStudentIds = {
    ...foundClassroom.studentIds,
    [normalized]: studentEntry
  };

  await db.set(
    { collection: 'classrooms', id: docId },
    { ...foundClassroom, studentIds: updatedStudentIds },
    true
  );

  return { ...foundClassroom, studentIds: updatedStudentIds };
}

// Add student to classroom in database and update store (action)
export const studentAdded = (
  classroomId: string,
  studentId: string,
  studentEntry: Record<string, unknown>
) => ({
  type: 'classrooms/student-added',
  classroomId,
  studentId,
  studentEntry
});

// Remove student from classroom in database and update store
export const removeStudentFromClassroom = async (
  studentId: string,
  currentClassroom: Classroom
) => {
  const exisitingStudentIds = Object.keys(currentClassroom.studentIds);
  if (exisitingStudentIds.includes(studentId)) {
    const updatedStudentIds = { ...currentClassroom.studentIds };
    delete updatedStudentIds[studentId];
    const docId = currentClassroom.docId;

    await db.set(
      { collection: 'classrooms', id: docId },
      { ...currentClassroom, studentIds: updatedStudentIds },
      false
    );

    store.dispatch(
      ClassroomsAction.setClassroom({
        classroomId: docId,
        classroom: Async.loaded({
          brief: {},
          value: { ...currentClassroom, studentIds: updatedStudentIds }
        })
      })
    );
  }

};

// Check if student is in any classroom
export const studentInClassroom = async (
  studentId: string
): Promise<{ inClassroom: boolean; classroom: Classroom | null }> => {
  try {
    const result = await db.get<Record<string, Classroom>>(
      Selector.classroom('myClassroom')
    );
    const normalized =
      typeof studentId === 'string' ? studentId : studentId['en-US'];

    // Extract the real Classroom object
    const classroom = result ? Object.values(result)[0] : null;

    if (!classroom || !classroom.studentIds) {
      return { inClassroom: false, classroom: null };
    }

    const inClass = normalized in classroom.studentIds;

    return { inClassroom: inClass, classroom: inClass ? classroom : null };
  } catch (error) {
    console.error('Error checking if student has classroom:', error);
    return { inClassroom: false, classroom: null };
  }
};

// Find classroom by readable classroom ID and teacher ID
export const findClassroomDocByReadableId = async (
  classroomId: string, teacherId: string
): Promise<{ docId: string; classroom: Classroom } | null> => {
  const classrooms = await db.list<Classroom>('classrooms');
  const entry = Object.entries(classrooms).find(
    ([, classroom]) => classroom.classroomId === classroomId && classroom.teacherId === teacherId
  );

  if (!entry) return null;

  const [docId, classroom] = entry;
  return { docId, classroom };
};

// Find classroom by invite code
export const findClassroomByInviteCode = async (inviteCode: string): Promise<Classroom | null> => {
  try {
    const result = await db.list<Classroom>(`classrooms?inviteCode=${inviteCode}`);

    for (const classroom of Object.values(result)) {
      const classroomCode = typeof classroom.code === 'string' ? classroom.code : classroom.code['en-US'];
      if (
        classroomCode.localeCompare(inviteCode, undefined, { sensitivity: 'base' }) === 0
      ) {
        return classroom;
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding classroom by invite code:', error);
    return null;
  }
};

export const setAssignment = async (
  classroom: Classroom,
  assignment: ClassroomAssignment,
  studentIds: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>
) => {
  try {
    const docId = classroom.docId;
    if (!docId) throw new Error('Classroom docId is required to set assignment');

    const updatedStudentIds = Object.fromEntries(
      Object.values(studentIds).map(student => {
        if (!classroom.studentIds[student.id]) {
          throw new Error(`Student with ID ${student.id} is not in the classroom`);
        }

        return [
          student.id,
          {
            ...student,
            assignments: {
              ...student.assignments,
              [assignment.title]: assignment,
            },
          },
        ];
      })
    );

    const updatedTopics = {
      ...classroom.topics,
      [assignment.topic || 'No Subject']: [
        ...(classroom.topics?.[assignment.topic || 'No Subject'] || []),
        assignment.title,
      ],
    };
    console.log("Updated studentIds with new assignment: ", updatedStudentIds);
    console.log("Updated topics with new assignment: ", updatedTopics);

    const updatedClassroom = {
      ...classroom,
      classroomAssignments: {
        ...classroom.classroomAssignments,
        [assignment.title]: assignment,
      },
      studentIds: updatedStudentIds,
      topics: updatedTopics,
    };

    await db.set(
      { collection: 'classrooms', id: docId },
      updatedClassroom,
      true
    );

    store.dispatch(
      ClassroomsAction.setClassroom({
        classroomId: docId,
        classroom: Async.loaded({
          brief: {},
          value: updatedClassroom
        })
      })
    );

    console.log("Successfully set assignment and updated store with classroom: ", updatedClassroom);
  } catch (error) {
    console.error('Error setting assignment:', error);
  }
};

export const getAssignments = async (classroomDocId: string) => {
  try {
    const result = await db.get<Record<string, ClassroomAssignment>>(
      Selector.classroom(classroomDocId)
    );
    console.log("getAssignments raw assignments result from DB: ", result);
    return result || {};
  } catch (error) {
    console.error('Error getting assignments:', error);
    return {};
  }
};

export interface ClassroomsState {
  entities: Dict<AsyncClassroom>;
  selectedClassroom: AsyncClassroom | null;
  currentStudentClassroom: AsyncClassroom | null;
}


export const reduceClassrooms = (
  state: ClassroomsState = { entities: {}, selectedClassroom: null, currentStudentClassroom: null },
  action: ClassroomsAction
): ClassroomsState => {
  switch (action.type) {

    case 'classrooms/add-classroom-topic': {
      const { classroomDocId, topic } = action;
      console.log("Adding topic to classroom. Doc ID: ", classroomDocId, " Topic: ", topic);
      return state;
    }
    case 'classrooms/set-assignment': {
      const { classroom, assignment, studentIds } = action;
      const docId = classroom.docId;

      if (!docId) return state;

      const updatedStudentIds = Object.fromEntries(
        Object.values(studentIds).map(student => [
          student.id,
          {
            ...student,
            assignments: {
              ...student.assignments,
              [assignment.title]: assignment,
            },
          },
        ])
      );

      const updatedClassroom = {
        ...classroom,
        classroomAssignments: {
          ...classroom.classroomAssignments,
          [assignment.title]: assignment,
        },
        studentIds: updatedStudentIds,
      };

      void setAssignment(updatedClassroom, assignment, updatedStudentIds);

      const asyncUpdatedClassroom = Async.loaded({
        brief: {},
        value: updatedClassroom,
      });

      return {
        ...state,
        entities: {
          ...state.entities,
          [docId]: asyncUpdatedClassroom,
        },
        selectedClassroom: asyncUpdatedClassroom,
      };
    }
    case 'classrooms/get-assignments': {
      void getAssignments(action.classroomDocId);
      return state;
    }
    case 'classrooms/load-classroom': {
      void load(action.classroomId, state.entities[action.classroomId]);
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.classroomId]: Async.loading({
            brief: Async.brief(state.entities[action.classroomId]),
          }),
        },
      };
    }

    case 'classrooms/show-classroom-leaderboard': {
      return {
        ...state,
        selectedClassroom: action.classroom,
      };
    }
    case 'classrooms/create-classroom': {
      const creating = Async.creating({ value: action.classroom });
      void create(creating);
      return state;
    }

    case 'classrooms/delete-classroom': {
      const { classroomId } = action;
      const entities = { ...state.entities };
      delete entities[classroomId];
      return {
        ...state,
        entities
      };
    }


    case 'classrooms/set-classroom': {
      return {
        ...state,
        [action.classroomId]: action.classroom,
      };
    }

    case 'classrooms/set-classrooms': {
      const merged = { ...state.entities, ...action.classrooms, };
      return { ...state, entities: merged, };
    }

    case 'classrooms/list-owned-classrooms': {
      void listOwned();
      return state;
    }
    case 'classrooms/list-challenges-by-student-id': {
      void listChallengesByStudentId(action.studentId);
      return state;
    }
    case 'classrooms/student-added': {
      const asyncClassroom = state.entities[action.classroomId];
      if (!asyncClassroom || asyncClassroom.type !== Async.Type.Loaded) return state;

      const classroom = asyncClassroom.value;

      const updated = {
        ...classroom,
        studentIds: {
          ...classroom.studentIds,
          [action.studentId]: { id: action.studentId, displayName: action.displayName }
        }
      };

      return {
        ...state,
        entities: {
          ...state.entities,
          [action.classroomId]: Async.loaded({
            brief: asyncClassroom.brief,
            value: updated
          })
        }
      };
    }

    case 'classrooms/join-classroom': {
      return {
        ...state,
        currentStudentClassroom: Async.loaded({
          brief: {},
          value: action.classroom
        })

      };

    }
    case 'classrooms/remove-student-from-classroom': {
      void removeStudentFromClassroom(action.studentId, action.currentClassroom);

      return {
        ...state,
        currentStudentClassroom: null
      };
    }

    case 'classrooms/student-in-classroom': {

      void studentInClassroom(action.studentId);
      return state;
    }



    case 'classrooms/find-classroom-by-invite-code': {
      void findClassroomByInviteCode(action.inviteCode);
      return state;
    }

    case 'classrooms/clear-selected-classroom': {
      return {
        ...state,
        selectedClassroom: null
      };
    }

    case 'classrooms/set-classroom-internal': {
      const { classroomId, classroom } = action;
      return {
        ...state,
        [classroomId]: classroom
      };
    }



    default:
      return state;
  }
};
