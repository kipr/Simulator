import db from '../db';
import Selector from '../db/Selector';
import Author from '../db/Author';
import Scene from '../state/State/Scene';
import Async from '../state/State/Async';
import Dict from './objectOps/Dict';
import {
  Classroom,
  ClassroomSharedCustomChallenge,
} from '../state/State/Classroom';
import { ClassroomsState } from '../state/reducer/classrooms';
import { isCustomChallengeId } from './customChallengeFactory';
import { challengeFromScene } from './customChallengeStorage';
import Challenge from '../state/State/Challenge';

export function isClassroomSharedReadOnlyScene(scene: Scene | null | undefined): boolean {
  return !!scene?.customChallengeReadOnly;
}

export function collectCustomChallengeSceneIdsFromClassroom(
  classroom: Classroom
): Set<string> {
  const ids = new Set<string>();
  const assignments = classroom.classroomAssignments ?? {};
  for (const assignment of Object.values(assignments)) {
    for (const entry of Object.values(assignment.challenges ?? {})) {
      const sceneId = entry.challenge?.sceneId;
      if (sceneId && isCustomChallengeId(sceneId)) {
        ids.add(sceneId);
      }
    }
  }
  return ids;
}

export function prepareSceneForClassroomShare(
  scene: Scene,
  teacherId: string,
  classroomDocId: string
): Scene {
  const next = JSON.parse(JSON.stringify(scene)) as Scene;
  next.customChallengeReadOnly = true;
  next.customChallengeClassroomShare = {
    classroomDocId,
    teacherId,
  };
  return next;
}

export async function classroomWithSyncedSharedCustomChallenges(
  classroom: Classroom,
  teacherId: string
): Promise<Classroom> {
  const docId = classroom.docId;
  if (!docId) return classroom;

  const referenced = collectCustomChallengeSceneIdsFromClassroom(classroom);
  const previous = classroom.sharedCustomChallenges ?? {};
  const nextShared: Dict<ClassroomSharedCustomChallenge> = {};

  for (const sceneId of referenced) {
    if (previous[sceneId]) {
      nextShared[sceneId] = previous[sceneId];
    }
    try {
      const scene = await db.get<Scene>(Selector.scene(sceneId));
      nextShared[sceneId] = {
        sceneId,
        scene: prepareSceneForClassroomShare(scene, teacherId, docId),
        sharedByTeacherId: teacherId,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Failed to snapshot custom challenge ${sceneId} for classroom`, error);
      if (previous[sceneId]) {
        nextShared[sceneId] = previous[sceneId];
      }
    }
  }

  return {
    ...classroom,
    sharedCustomChallenges: nextShared,
  };
}

export function findClassroomSharedCustomChallenge(
  classroomsState: ClassroomsState,
  studentId: string | undefined,
  sceneId: string
): ClassroomSharedCustomChallenge | null {
  if (!studentId) return null;

  const fromClassroom = (classroom: Classroom | undefined): ClassroomSharedCustomChallenge | null => {
    if (!classroom?.sharedCustomChallenges?.[sceneId]) return null;
    return classroom.sharedCustomChallenges[sceneId];
  };

  const current = Async.latestValue(classroomsState.currentStudentClassroom);
  const hit = fromClassroom(current ?? undefined);
  if (hit) return hit;

  for (const asyncClassroom of Object.values(classroomsState.entities)) {
    const classroom = Async.latestValue(asyncClassroom);
    if (!classroom?.studentIds?.[studentId]) continue;
    const shared = fromClassroom(classroom);
    if (shared) return shared;
  }

  return null;
}

export function sharedCustomChallengeSceneForStudent(
  classroomsState: ClassroomsState,
  studentId: string | undefined,
  sceneId: string
): Scene | null {
  const shared = findClassroomSharedCustomChallenge(classroomsState, studentId, sceneId);
  return shared?.scene ?? null;
}

export function sharedCustomChallengeForStudent(
  classroomsState: ClassroomsState,
  studentId: string | undefined,
  sceneId: string
): Challenge | null {
  const scene = sharedCustomChallengeSceneForStudent(classroomsState, studentId, sceneId);
  if (!scene) return null;
  return challengeFromScene(sceneId, scene);
}

export function isTeacherOwnedCustomChallenge(
  challenge: Challenge | null | undefined,
  teacherId: string | undefined
): boolean {
  if (!challenge || !teacherId || !isCustomChallengeId(challenge.sceneId)) return false;
  return (
    challenge.author?.type === Author.Type.User && challenge.author.id === teacherId
  );
}
