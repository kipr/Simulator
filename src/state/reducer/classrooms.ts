import store from '..';
import { AsyncClassroom, ClassroomBrief, Classroom, ClassroomAssignment } from '../State/Classroom';
import Async from '../State/Async';
import Dict from '../../util/objectOps/Dict';
import Selector from '../../db/Selector';
import db from '../../db';
import { auth } from '../../firebase/firebase';
import { errorToAsyncError } from './util';
import construct from '../../util/redux/construct';
import ChallengeCompletion from 'state/State/ChallengeCompletion';
import { mergeChallengePointsOverride } from '../../util/classroomGradeOverrides';
import { classroomWithSyncedSharedCustomChallenges } from '../../util/customChallengeClassroomShare';

/**
 * Canonical topic index: each topic maps to assignment titles in that topic.
 * Rebuilt from assignments so create/edit/delete never duplicates or leaves stale titles.
 */
function rebuildTopicsFromClassroomAssignments(
  classroomAssignments: Dict<ClassroomAssignment> | undefined
): Dict<string[]> | undefined {
  if (!classroomAssignments || Object.keys(classroomAssignments).length === 0) {
    return undefined;
  }
  const topics: Dict<string[]> = {};
  for (const assignment of Object.values(classroomAssignments)) {
    if (!assignment?.title) continue;
    const topicKey = assignment.topic || 'No Subject';
    if (!topics[topicKey]) topics[topicKey] = [];
    const list = topics[topicKey];
    if (!list.includes(assignment.title)) {
      list.push(assignment.title);
    }
  }
  return Object.keys(topics).length > 0 ? topics : undefined;
}

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
    classroom: AsyncClassroom;
  }

  export const joinClassroom = construct<JoinClassroom>('classrooms/join-classroom');
  export interface RemoveStudentFromClassroom {
    type: 'classrooms/remove-student-from-classroom';
    studentId: string;
    currentClassroom: AsyncClassroom;
    /** When false, only update Redux (caller already persisted). */
    persist?: boolean;
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
  export interface DeleteAssignment {
    type: 'classrooms/delete-assignment';
    classroom: Classroom;
    assignmentDocId: string;
  }
  export const deleteAssignment = construct<DeleteAssignment>('classrooms/delete-assignment');


  export interface GetGradebook {
    type: 'classrooms/get-gradebook';
    classroomDocId: string;

  }
  export const getGradebook = construct<GetGradebook>('classrooms/get-gradebook');

  export interface EditAssignment {
    type: 'classrooms/edit-assignment';
    classroom: Classroom;
    assignmentDocId: string;
    assignment: ClassroomAssignment;
  }

  export const editAssignment = construct<EditAssignment>('classrooms/edit-assignment');

  export interface SetChallengePointsOverride {
    type: 'classrooms/set-challenge-points-override';
    classroom: Classroom;
    studentId: string;
    assignment: ClassroomAssignment;
    sceneId: string;
    /** null removes override (revert to assignment default points) */
    overridePoints: number | null;
  }

  export const setChallengePointsOverride = construct<SetChallengePointsOverride>('classrooms/set-challenge-points-override');

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
  | ClassroomsAction.DeleteAssignment
  | ClassroomsAction.GetGradebook
  | ClassroomsAction.EditAssignment
  | ClassroomsAction.SetChallengePointsOverride;

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

    const classrooms: Dict<AsyncClassroom> = {};
    Object.entries(result).forEach(([id, raw]) => {
      const classroomData = classroomFromListPayload(raw, id);
      if (classroomData) {
        classrooms[id] = Async.loaded({ brief: {}, value: classroomData });
      }
    });
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

export const listChallengesByStudentIds = async (
  studentIds: string[]
): Promise<Dict<Dict<ChallengeCompletion>>> => {
  const entries = await Promise.all(
    studentIds.map(async (studentId) => {
      const completions = await listChallengesByStudentId(studentId);
      return [studentId, completions] as const;
    })
  );

  return Object.fromEntries(entries);
};

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
  returnedClassroom: AsyncClassroom,
  inviteCode: string,
  studentId: string,
  displayName: string
): Promise<AsyncClassroom | null> {

  const foundClassroom = returnedClassroom;
  if (!foundClassroom) return null;

  const normalized = studentId;

  const studentEntry = {
    id: studentId,
    displayName: displayName
  };
  const docId = Async.latestValue(foundClassroom).docId;

  const updatedStudentIds = {
    ...Async.latestValue(foundClassroom).studentIds,
    [normalized]: studentEntry
  };

  await db.set(
    { collection: 'classrooms', id: docId },
    { studentIds: updatedStudentIds },
    true
  );

  const updatedClassroom = {
    ...Async.latestValue(foundClassroom),
    studentIds: updatedStudentIds
  };

  const updatedValue = {
    ...Async.latestValue(foundClassroom),
    docId: docId || Async.latestValue(foundClassroom).docId,
    studentIds: updatedStudentIds,
  };
  const asyncClassroom: AsyncClassroom = {
    type: Async.Type.Loaded,
    value: updatedValue,
  };

  if (docId) {
    store.dispatch(
      ClassroomsAction.setClassrooms({
        classrooms: { [docId]: asyncClassroom },
      })
    );
  }

  return asyncClassroom;
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

function resolveClassroomDocId(
  classroom: Classroom,
  entities: Dict<AsyncClassroom> = store.getState().classrooms.entities
): string | undefined {
  for (const [entityId, asyncClassroom] of Object.entries(entities)) {
    if (asyncClassroom.type !== Async.Type.Loaded) continue;
    if (asyncClassroom.value.classroomId === classroom.classroomId) {
      return entityId;
    }
  }

  return classroom.docId?.trim() || undefined;
}

async function loadStudentEnrollmentFromServer(): Promise<{
  docId: string;
  classroom: Classroom;
} | null> {
  const result = await db.get<Record<string, Classroom>>(
    Selector.classroom('myClassroom')
  );
  const entry = result ? Object.entries(result)[0] : undefined;
  if (!entry) return null;
  const [docId, raw] = entry;
  return { docId, classroom: { ...raw, docId } };
}

function studentIdFromRosterEntry(
  entry: { id?: string | Dict<string> } | undefined
): string | undefined {
  if (!entry?.id) return undefined;
  if (typeof entry.id === 'string') return entry.id;
  if (typeof entry.id === 'object' && entry.id['en-US']) return entry.id['en-US'];
  return undefined;
}

function omitStudentFromRoster(
  studentIds: Classroom['studentIds'] | undefined,
  studentId: string
): Classroom['studentIds'] {
  const next = { ...(studentIds || {}) };
  for (const [key, entry] of Object.entries(next)) {
    if (key === studentId || studentIdFromRosterEntry(entry) === studentId) {
      delete next[key];
    }
  }
  return next;
}

function removeStudentFromAssignmentAssignedTo(
  classroomAssignments: Classroom['classroomAssignments'] | undefined,
  studentId: string
): Classroom['classroomAssignments'] | undefined {
  if (!classroomAssignments) return classroomAssignments;
  let changed = false;
  const next: Dict<ClassroomAssignment> = {};
  for (const [assignmentKey, assignment] of Object.entries(classroomAssignments)) {
    if (!assignment?.assignedTo) {
      next[assignmentKey] = assignment;
      continue;
    }
    const assignedTo = { ...assignment.assignedTo };
    for (const [key, entry] of Object.entries(assignedTo)) {
      if (key === studentId || studentIdFromRosterEntry(entry) === studentId) {
        delete assignedTo[key];
        changed = true;
      }
    }
    next[assignmentKey] = changed
      ? { ...assignment, assignedTo }
      : assignment;
  }
  return changed ? next : classroomAssignments;
}

/** Roster + assignment assignees after a student leaves or is removed. */
export function applyStudentRemovedFromClassroom(
  classroom: Classroom,
  studentId: string
): Classroom {
  const studentIds = omitStudentFromRoster(classroom.studentIds, studentId);
  const classroomAssignments = removeStudentFromAssignmentAssignedTo(
    classroom.classroomAssignments,
    studentId
  );
  let challengePointsOverrides = classroom.challengePointsOverrides;
  if (challengePointsOverrides?.[studentId]) {
    challengePointsOverrides = { ...challengePointsOverrides };
    delete challengePointsOverrides[studentId];
  }
  return {
    ...classroom,
    studentIds,
    classroomAssignments,
    challengePointsOverrides,
  };
}

function classroomEntityAfterStudentRemoved(
  state: ClassroomsState,
  classroom: Classroom,
  studentId: string
): { docId: string | undefined; entity: AsyncClassroom | null } {
  const docId = resolveClassroomDocId(classroom, state.entities);
  if (!docId) return { docId: undefined, entity: null };
  const cleaned = applyStudentRemovedFromClassroom(classroom, studentId);
  return {
    docId,
    entity: Async.loaded({
      brief: {},
      value: { ...cleaned, docId },
    }),
  };
}

/** POST /api/classrooms/leave or /api/classrooms/:id/leave (classrooms.js). */
async function postClassroomLeave(docId?: string): Promise<void> {
  const id = docId ? `${docId}/leave` : 'leave';
  await db.set(Selector.classroom(id), {}, false);
}

/** DELETE /api/classrooms/:id/students/:studentId (classrooms.js). */
async function deleteClassroomStudent(docId: string, studentId: string): Promise<void> {
  await db.delete(Selector.classroom(`${docId}/students/${studentId}`));
}

/** PATCH roster + assignments after removal (classrooms.js applyRosterPatch + applyClassroomAssignmentsPatch). */
async function patchClassroomAfterStudentRemoval(
  docId: string,
  classroom: Classroom,
  studentId: string
): Promise<void> {
  const cleaned = applyStudentRemovedFromClassroom(classroom, studentId);
  await db.set(
    Selector.classroom(docId),
    {
      studentIds: cleaned.studentIds ?? {},
      classroomAssignments: cleaned.classroomAssignments ?? {},
    },
    true
  );
}

function isDbNotFound(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const e = error as { code?: unknown };
  return e.code === 404;
}

// Remove student from classroom in database and update store
export const removeStudentFromClassroom = async (
  studentId: string,
  currentClassroom: AsyncClassroom
) => {
  const classroom = Async.latestValue(currentClassroom);
  const authUid = auth.currentUser?.uid;
  const isSelfLeave = !!authUid && studentId === authUid;

  if (isSelfLeave) {
    try {
      await postClassroomLeave();
      return;
    } catch (error) {
      if (!isDbNotFound(error)) throw error;
    }

    const docId =
      resolveClassroomDocId(classroom) || classroom.docId?.trim();

    if (!docId) {
      throw new Error('Cannot leave classroom: classroom not found on server');
    }

    try {
      await postClassroomLeave(docId);
      return;
    } catch (error) {
      if (!isDbNotFound(error)) throw error;
    }

    throw new Error('Cannot leave classroom: classroom not found on server');
  }

  const docId = resolveClassroomDocId(classroom);
  if (!docId) {
    throw new Error('Cannot remove student: missing classroom document id');
  }

  try {
    await deleteClassroomStudent(docId, studentId);
  } catch (error) {
    if (!isDbNotFound(error)) throw error;
    await patchClassroomAfterStudentRemoval(docId, classroom, studentId);
  }
};

// Check if student is in any classroom
export const studentInClassroom = async (
  studentId: string
): Promise<{ inClassroom: boolean; classroom: AsyncClassroom | null }> => {
  try {
    const result = await db.get<Record<string, Classroom>>(
      Selector.classroom('myClassroom')
    );
    const normalized =
      typeof studentId === 'string' ? studentId : studentId['en-US'];

    const entry = result ? Object.entries(result)[0] : undefined;
    if (!entry) {
      return { inClassroom: false, classroom: null };
    }

    const [docId, rawClassroom] = entry;
    const classroom: Classroom = {
      ...rawClassroom,
      docId,
    };

    if (!classroom.studentIds) {
      return { inClassroom: false, classroom: null };
    }

    const inClass =
      normalized in classroom.studentIds ||
      Object.values(classroom.studentIds).some(
        (entry) =>
          entry &&
          (entry.id === normalized ||
            (typeof entry.id === 'object' &&
              entry.id !== null &&
              entry.id['en-US'] === normalized))
      );

    const asyncClassroom: AsyncClassroom = {
      brief: {},
      type: Async.Type.Loaded,
      value: classroom,
    };

    store.dispatch(ClassroomsAction.setClassrooms({ classrooms: { [docId]: asyncClassroom } }));
    return { inClassroom: inClass, classroom: inClass ? asyncClassroom : null };
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

/** Invite code as stored on the classroom (string or localized map from Firestore). */
function classroomInviteCodeString(code: Classroom['code'] | Dict<string> | undefined): string | undefined {
  if (typeof code === 'string') return code;
  if (code && typeof code === 'object' && 'en-US' in code) {
    const v = (code)['en-US'];
    return typeof v === 'string' ? v : undefined;
  }
  return undefined;
}

/**
 * `db.list('classrooms')` returns plain classroom documents; owned-classroom paths wrap in Async.loaded.
 */
function classroomFromListPayload(raw: unknown, docIdFromKey: string): Classroom | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Record<string, unknown>;
  if (v.type === Async.Type.Loaded && v.value && typeof v.value === 'object') {
    const inner = v.value as Classroom;
    return { ...inner, docId: docIdFromKey, studentIds: inner.studentIds ?? {} };
  }
  const c = raw as Classroom;
  if (typeof c.teacherId === 'string' && c.teacherId.length > 0) {
    return { ...c, docId: docIdFromKey, studentIds: c.studentIds ?? {} };
  }
  return null;
}

// Find classroom by invite code
export const findClassroomByInviteCode = async (inviteCode: string): Promise<AsyncClassroom | null> => {
  try {
    const trimmed = inviteCode.trim();
    const result = await db.list<Classroom>(`classrooms?inviteCode=${encodeURIComponent(trimmed)}`);

    for (const [docId, raw] of Object.entries(result)) {
      const classroomData = classroomFromListPayload(raw, docId);
      if (!classroomData) continue;

      const classroomCode = classroomInviteCodeString(classroomData.code);
      if (
        classroomCode &&
        classroomCode.localeCompare(trimmed, undefined, { sensitivity: 'base' }) === 0
      ) {
        return Async.loaded({ brief: {}, value: classroomData });
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding classroom by invite code:', error);
    return null;
  }
};

/** Writes the full classroom document after local merge (assignments, students, etc.). */
async function saveClassroomDocument(classroom: Classroom): Promise<void> {
  const docId = classroom.docId;
  if (!docId) {
    console.error('saveClassroomDocument: classroom.docId is required');
    return;
  }
  try {
    await db.set(
      { collection: 'classrooms', id: docId },
      classroom,
      true
    );
  } catch (error) {
    console.error('Error saving classroom document:', error);
  }
}

/** Updates the human-readable `classroomId` on an existing classroom document (stable Firestore `docId`). */
export async function renameClassroomById(
  classroom: Classroom,
  newClassroomIdRaw: string
): Promise<{ ok: true; classroom: Classroom } | { ok: false; error: 'empty' | 'unchanged' | 'duplicate' | 'missing-doc' | 'save-failed' }> {
  const docId = classroom.docId;
  if (!docId) {
    return { ok: false, error: 'missing-doc' };
  }
  const newClassroomId = newClassroomIdRaw.trim();
  if (!newClassroomId) {
    return { ok: false, error: 'empty' };
  }
  if (newClassroomId === classroom.classroomId) {
    return { ok: false, error: 'unchanged' };
  }
  const entities = store.getState().classrooms.entities;
  for (const asyncC of Object.values(entities)) {
    if (
      asyncC.type === Async.Type.Loaded &&
      asyncC.value.docId !== docId &&
      asyncC.value.classroomId === newClassroomId
    ) {
      return { ok: false, error: 'duplicate' };
    }
  }
  const updated: Classroom = {
    ...classroom,
    classroomId: newClassroomId,
  };
  try {
    await db.set({ collection: 'classrooms', id: docId }, updated, true);
  } catch (error) {
    console.error('Error renaming classroom:', error);
    return { ok: false, error: 'save-failed' };
  }
  store.dispatch(
    ClassroomsAction.setClassrooms({
      classrooms: {
        [docId]: Async.loaded({ brief: {}, value: updated }),
      },
    })
  );
  return { ok: true, classroom: updated };
}

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

    const nextClassroomAssignments: Dict<ClassroomAssignment> = {
      ...classroom.classroomAssignments,
      [assignment.title]: assignment,
    };
    const updatedTopics = rebuildTopicsFromClassroomAssignments(nextClassroomAssignments);

    // Keep all enrolled students; only the assignee list gets this assignment merged onto their record.
    const mergedStudentIds: Dict<{ id: string; displayName: string; assignments?: Dict<ClassroomAssignment> }> = {
      ...classroom.studentIds,
      ...updatedStudentIds,
    };

    let updatedClassroom = {
      ...classroom,
      classroomAssignments: nextClassroomAssignments,
      studentIds: mergedStudentIds,
      topics: updatedTopics,
    };

    updatedClassroom = await classroomWithSyncedSharedCustomChallenges(
      updatedClassroom,
      classroom.teacherId
    );

    await db.set(
      { collection: 'classrooms', id: docId },
      updatedClassroom,
      true
    );

  } catch (error) {
    console.error('Error setting assignment:', error);
  }
};

export const getAssignments = async (classroomDocId: string) => {
  try {
    const result = await db.get<Record<string, ClassroomAssignment>>(
      Selector.classroom(classroomDocId)
    );
    return result || {};
  } catch (error) {
    console.error('Error getting assignments:', error);
    return {};
  }
};

export const deleteAssignment = async (classroom: Classroom, assignmentDocId: string) => {
  try {
    const docId = classroom.docId;
    if (!docId) throw new Error('Classroom docId is required to delete assignment');

    const previousClassroomAssignments = classroom.classroomAssignments || {};

    const assignmentToDelete = Object.values(previousClassroomAssignments).find(a => a.docId === assignmentDocId);
    if (!assignmentToDelete) {
      throw new Error(`Assignment with docId ${assignmentDocId} not found in classroom`);
    }
    delete previousClassroomAssignments[assignmentToDelete.title];

    const updatedTopics = rebuildTopicsFromClassroomAssignments(previousClassroomAssignments);
    let updatedClassroom = {
      ...classroom,
      classroomAssignments: previousClassroomAssignments,
      topics: updatedTopics,
    };

    updatedClassroom = await classroomWithSyncedSharedCustomChallenges(
      updatedClassroom,
      classroom.teacherId
    );

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

  } catch (error) {
    console.error('Error deleting assignment:', error);
  }
};

export const getGradebook = async (classroomDocId: string) => {

  try {
    const result = await db.get<Dict<Dict<ChallengeCompletion>>>(
      Selector.classroom(`${classroomDocId}/gradebook/challenges`)
    );
    return result || {};
  } catch (error) {
    console.error('Error getting gradebook:', error);
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
    case 'classrooms/edit-assignment': {
      const { classroom, assignmentDocId, assignment: updatedAssignment } = action;
      const docId = classroom.docId;
      if (!docId) throw new Error('Classroom docId is required to edit assignment');

      const previousClassroomAssignments = classroom.classroomAssignments || {};
      const assignmentToEdit = Object.values(previousClassroomAssignments).find(a => a.docId === assignmentDocId);
      if (!assignmentToEdit) {
        throw new Error(`Assignment with docId ${assignmentDocId} not found in classroom`);
      }

      const mergedAssignment: ClassroomAssignment = {
        ...assignmentToEdit,
        ...updatedAssignment,
        docId: assignmentToEdit.docId,
      };

      const oldTitle = assignmentToEdit.title;
      const newTitle = mergedAssignment.title;

      const updatedClassroomAssignments: Dict<ClassroomAssignment> = {
        ...previousClassroomAssignments,
      };
      if (newTitle !== oldTitle) {
        delete updatedClassroomAssignments[oldTitle];
      }
      updatedClassroomAssignments[newTitle] = mergedAssignment;

      const assignedRecipients = mergedAssignment.assignedTo || {};
      const previousClassroomStudents = classroom.studentIds || {};
      const updatedStudentIds = Object.fromEntries(
        Object.values(previousClassroomStudents).map(student => {
          const isAssigned = Object.values(assignedRecipients).some(s => s.id === student.id);
          const previousAssignments = student.assignments || {};

          const updatedAssignments = isAssigned
            ? (() => {
              const rest = Object.fromEntries(
                Object.entries(previousAssignments).filter(
                  ([t]) => t !== oldTitle && t !== newTitle
                )
              );
              return {
                ...rest,
                [newTitle]: {
                  ...(previousAssignments[oldTitle] || previousAssignments[newTitle]),
                  ...mergedAssignment,
                },
              };
            })()
            : Object.fromEntries(
              Object.entries(previousAssignments).filter(
                ([title]) => title !== oldTitle && title !== newTitle
              )
            );

          return [
            student.id,
            {
              ...student,
              assignments: updatedAssignments,
            },
          ];
        })
      );

      const updatedClassroom: Classroom = {
        ...classroom,
        classroomAssignments: updatedClassroomAssignments,
        studentIds: updatedStudentIds,
        topics: rebuildTopicsFromClassroomAssignments(updatedClassroomAssignments),
      };

      void (async () => {
        const synced = await classroomWithSyncedSharedCustomChallenges(
          updatedClassroom,
          classroom.teacherId
        );
        await saveClassroomDocument(synced);
        store.dispatch(
          ClassroomsAction.setClassroom({
            classroomId: docId,
            classroom: Async.loaded({
              brief: Async.brief(state.entities[docId]),
              value: synced,
            }),
          })
        );
      })();

      return {
        ...state,
        entities: {
          ...state.entities,
          [docId]: Async.loaded({
            brief: Async.brief(state.entities[docId]),
            value: updatedClassroom,
          }),
        },
        selectedClassroom: Async.loaded({
          brief: Async.brief(state.selectedClassroom),
          value: updatedClassroom,
        }),
      };
    }

    case 'classrooms/get-gradebook': {
      void getGradebook(action.classroomDocId);
      return state;
    }

    case 'classrooms/set-challenge-points-override': {
      const { classroom, studentId, assignment, sceneId, overridePoints } = action;
      const docId = classroom.docId;
      if (!docId) return state;
      const updatedClassroom = mergeChallengePointsOverride(
        classroom,
        studentId,
        assignment,
        sceneId,
        overridePoints
      );
      const asyncClassroom = Async.loaded({
        brief: {},
        value: updatedClassroom,
      });
      const selected =
        state.selectedClassroom?.type === Async.Type.Loaded &&
          state.selectedClassroom.value.docId === docId
          ? asyncClassroom
          : state.selectedClassroom;
      void saveClassroomDocument(updatedClassroom);
      return {
        ...state,
        entities: {
          ...state.entities,
          [docId]: asyncClassroom,
        },
        selectedClassroom: selected,
      };
    }

    case 'classrooms/delete-assignment': {
      const { classroom, assignmentDocId } = action;
      void deleteAssignment(classroom, assignmentDocId);
      return state;
    }
    case 'classrooms/set-assignment': {
      const { classroom, assignment, studentIds } = action;
      const docId = classroom.docId;

      if (!docId) return state;

      const assignmentDocIds = Object.values(classroom.classroomAssignments || {}).map(a => a.docId);

      const uuid = crypto.randomUUID();
      const shortenedId = uuid.replace(/-/g, '').slice(-7);

      const shortenedDocIdExists = assignmentDocIds.includes(shortenedId);

      if (shortenedDocIdExists) {
        const newUuid = crypto.randomUUID();
        const newShortenedId = newUuid.replace(/-/g, '').slice(-7);
        assignment.docId = newShortenedId;
      } else {
        assignment.docId = shortenedId;
      }

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

      const mergedAssignments: Dict<ClassroomAssignment> = {
        ...classroom.classroomAssignments,
        [assignment.title]: assignment,
      };

      const updatedClassroom = {
        ...classroom,
        classroomAssignments: mergedAssignments,
        studentIds: {
          ...classroom.studentIds,
          ...updatedStudentIds,
        },
        topics: rebuildTopicsFromClassroomAssignments(mergedAssignments),
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
        entities: {
          ...state.entities,
          [action.classroomId]: action.classroom,
        },
      };
    }

    case 'classrooms/set-classrooms': {
      const merged = { ...state.entities, ...action.classrooms, };
      return { ...state, entities: merged, };
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
      const entityKey =
        state.entities[action.classroomId]
          ? action.classroomId
          : Object.entries(state.entities).find(
            ([, asyncClassroom]) =>
              asyncClassroom.type === Async.Type.Loaded &&
              asyncClassroom.value.docId === action.classroomId
          )?.[0];
      if (!entityKey) return state;

      const asyncClassroom = state.entities[entityKey];
      if (!asyncClassroom || asyncClassroom.type !== Async.Type.Loaded) return state;

      const classroom = asyncClassroom.value;
      const studentIds = {
        ...(classroom.studentIds ?? {}),
        [action.studentId]: { id: action.studentId, displayName: action.displayName },
      };

      const updated = { ...classroom, studentIds };
      const loaded = Async.loaded({
        brief: asyncClassroom.brief,
        value: updated,
      });

      const selectedClassroom =
        state.selectedClassroom?.type === Async.Type.Loaded &&
        resolveClassroomDocId(state.selectedClassroom.value, state.entities) === entityKey
          ? loaded
          : state.selectedClassroom;

      return {
        ...state,
        entities: {
          ...state.entities,
          [entityKey]: loaded,
        },
        selectedClassroom,
      };
    }

    case 'classrooms/join-classroom': {
      return {
        ...state,
        currentStudentClassroom: action.classroom,

      };

    }
    case 'classrooms/remove-student-from-classroom': {
      if (action.persist !== false) {
        void removeStudentFromClassroom(action.studentId, action.currentClassroom);
      }

      const classroom = Async.latestValue(action.currentClassroom);
      const { docId, entity } = classroomEntityAfterStudentRemoved(
        state,
        classroom,
        action.studentId
      );

      const entities = entity && docId
        ? { ...state.entities, [docId]: entity }
        : state.entities;

      const selectedClassroom =
        entity &&
        docId &&
        state.selectedClassroom?.type === Async.Type.Loaded &&
        resolveClassroomDocId(state.selectedClassroom.value, state.entities) === docId
          ? entity
          : state.selectedClassroom;

      return {
        ...state,
        entities,
        selectedClassroom,
        ...(action.persist === false ? { currentStudentClassroom: null } : {}),
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
