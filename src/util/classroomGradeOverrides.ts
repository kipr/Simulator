import Dict from './objectOps/Dict';
import { Classroom, ClassroomAssignment } from '../state/State/Classroom';

/** Stable key for overrides: prefer assignment doc id, fall back to title. */
export function classroomAssignmentOverrideKey(assignment: ClassroomAssignment): string {
  return assignment.docId || assignment.title;
}

export function defaultChallengePoints(points: number | '' | undefined): number {
  return typeof points === 'number' ? points : 0;
}

export function getChallengePointsOverride(
  classroom: Classroom | undefined,
  studentId: string,
  assignment: ClassroomAssignment,
  sceneId: string
): number | undefined {
  if (!classroom?.challengePointsOverrides) return undefined;
  const k = classroomAssignmentOverrideKey(assignment);
  const v = classroom.challengePointsOverrides[studentId]?.[k]?.[sceneId];
  return typeof v === 'number' && !Number.isNaN(v) ? v : undefined;
}

export function getEffectiveChallengePoints(
  classroom: Classroom | undefined,
  studentId: string,
  assignment: ClassroomAssignment,
  sceneId: string,
  defaultPoints: number | '' | undefined
): number {
  const o = getChallengePointsOverride(classroom, studentId, assignment, sceneId);
  if (o !== undefined) return o;
  return defaultChallengePoints(defaultPoints);
}

/**
 * Returns updated classroom. `overridePoints === null` removes the override for that challenge.
 */
export function mergeChallengePointsOverride(
  classroom: Classroom,
  studentId: string,
  assignment: ClassroomAssignment,
  sceneId: string,
  overridePoints: number | null
): Classroom {
  const assignmentKey = classroomAssignmentOverrideKey(assignment);
  const root: Dict<Dict<Dict<number>>> = { ...(classroom.challengePointsOverrides || {}) };
  const studentMap: Dict<Dict<number>> = { ...(root[studentId] || {}) };
  const sceneMap: Dict<number> = { ...(studentMap[assignmentKey] || {}) };

  if (overridePoints === null) {
    delete sceneMap[sceneId];
  } else {
    sceneMap[sceneId] = Math.max(0, Math.floor(overridePoints));
  }

  if (Object.keys(sceneMap).length === 0) {
    delete studentMap[assignmentKey];
  } else {
    studentMap[assignmentKey] = sceneMap;
  }

  if (Object.keys(studentMap).length === 0) {
    delete root[studentId];
  } else {
    root[studentId] = studentMap;
  }

  const challengePointsOverrides = Object.keys(root).length === 0 ? undefined : root;
  return { ...classroom, challengePointsOverrides };
}
