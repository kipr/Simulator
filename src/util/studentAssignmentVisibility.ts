import { Classroom, ClassroomAssignment } from '../state/State/Classroom';

/** True if the assignment lists at least one student under `assignedTo`. */
export function assignmentHasAnyAssignee(assignment: ClassroomAssignment): boolean {
  return Object.keys(assignment.assignedTo ?? {}).length > 0;
}

/** True if the classroom has any assignment records (drafts or published). */
export function classroomHasAnyAssignments(classroom: Classroom | undefined): boolean {
  if (!classroom?.classroomAssignments) return false;
  return Object.keys(classroom.classroomAssignments).length > 0;
}

/** True only if `userId` appears in `assignment.assignedTo` (ignores legacy student record mirror). */
export function assignmentListsUserInAssignedTo(assignment: ClassroomAssignment, userId: string): boolean {
  if (!userId) return false;
  return Object.values(assignment.assignedTo ?? {}).some(u => u.id === userId);
}

/** Whether this assignment appears in the student’s Assignments tab (matches AssignmentsView filtering). */
export function assignmentIsAssignedToUser(
  classroom: Classroom | undefined,
  assignment: ClassroomAssignment,
  userId: string
): boolean {
  if (!userId || !classroom) return false;
  if (assignmentListsUserInAssignedTo(assignment, userId)) return true;
  const fromStudentRecord = classroom.studentIds?.[userId]?.assignments?.[assignment.title];
  return !!fromStudentRecord;
}

/** True if the student has at least one assignment row under Assignments. */
export function classroomHasAssignmentsVisibleToStudent(
  classroom: Classroom | undefined,
  userId: string
): boolean {
  if (!classroom?.classroomAssignments || !userId) return false;
  return Object.values(classroom.classroomAssignments).some(a =>
    assignmentIsAssignedToUser(classroom, a, userId)
  );
}
