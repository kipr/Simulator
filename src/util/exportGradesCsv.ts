import { Classroom, ClassroomAssignment } from '../state/State/Classroom';
import Dict from './objectOps/Dict';
import {
  completionTimestampFromProgress,
  completionVersusDueDate,
  isChallengeCompletionSuccessful,
} from './challengeCompletionStatus';
import { defaultChallengePoints, getChallengePointsOverride, getEffectiveChallengePoints } from './classroomGradeOverrides';

export function gradeExportChallengeKey(assignment: ClassroomAssignment, sceneId: string): string {
  const aKey = assignment.docId || assignment.title;
  return `${aKey}|||${sceneId}`;
}

/** When `keys` is empty, return `assignment` unchanged. Otherwise keep only matching challenges. */
export function narrowAssignmentToChallengeKeys(
  assignment: ClassroomAssignment,
  keys: string[]
): ClassroomAssignment {
  if (!assignment.challenges || keys.length === 0) return assignment;
  const next: typeof assignment.challenges = {};
  for (const [sceneId, entry] of Object.entries(assignment.challenges)) {
    if (keys.includes(gradeExportChallengeKey(assignment, sceneId))) {
      next[sceneId] = entry;
    }
  }
  if (Object.keys(next).length === 0) {
    return { ...assignment, challenges: undefined };
  }
  return { ...assignment, challenges: next };
}

function csvEscapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function csvRow(cells: string[]): string {
  return cells.map(csvEscapeCell).join(',');
}

export interface BuildGradesExportCsvParams {
  classroom: Classroom;
  classroomName: string;
  students: { id: string; displayName: string; assignments?: Dict<ClassroomAssignment> }[];
  /** Empty = include all students. */
  studentIdsFilter: string[];
  /** Assignments already filtered (e.g. by date). */
  assignments: ClassroomAssignment[];
  /** Empty = include all challenges. Otherwise only keys listed (see `gradeExportChallengeKey`). */
  challengeKeysFilter: string[];
  grades: Dict<Dict<unknown>> | null;
  locale: string;
}

function timingLabel(completedAt: string | undefined, dueDate: string | undefined): string {
  const v = completionVersusDueDate(completedAt, dueDate);
  if (v === 'on-time') return 'On time';
  if (v === 'late') return 'Late';
  if (v === 'no-deadline') return 'No deadline';
  return '—';
}

export function buildGradesExportCsv(p: BuildGradesExportCsvParams): string {
  const {
    classroom,
    students,
    studentIdsFilter,
    assignments,
    challengeKeysFilter,
    grades,
    locale,
  } = p;

  const header = csvRow([
    'Classroom',
    'Student ID',
    'Student name',
    'Assignment',
    'Challenge',
    'Scene ID',
    'Default points',
    'Points override',
    'Effective points',
    'Completed',
    'Completed at',
    'Timing vs due',
  ]);

  const rows: string[] = [header];

  const studentsIncluded =
    studentIdsFilter.length === 0 ? students : students.filter(s => studentIdsFilter.includes(s.id));

  for (const student of studentsIncluded) {
    const progress = grades?.[student.id] ?? null;
    for (const assignment of assignments) {
      const narrowed = narrowAssignmentToChallengeKeys(assignment, challengeKeysFilter);
      const list = narrowed.challenges ? Object.values(narrowed.challenges) : [];
      if (list.length === 0) continue;

      const assigned = !!(student.assignments && student.assignments[assignment.title]);
      if (!assigned) continue;

      for (const entry of list) {
        const sceneId = entry.challenge.sceneId;
        const name = entry.challenge.name;
        const prog = progress?.[sceneId] ?? null;
        const done = isChallengeCompletionSuccessful(prog);
        const completedAt = completionTimestampFromProgress(prog);
        const override = getChallengePointsOverride(classroom, student.id, assignment, sceneId);
        const effective = getEffectiveChallengePoints(classroom, student.id, assignment, sceneId, entry.points);
        const defPts = defaultChallengePoints(entry.points);

        rows.push(
          csvRow([
            p.classroomName,
            student.id,
            student.displayName,
            assignment.title,
            name,
            sceneId,
            String(defPts),
            override !== undefined ? String(override) : '',
            String(effective),
            done ? 'Yes' : 'No',
            completedAt ? new Date(completedAt).toLocaleString(locale) : '',
            done ? timingLabel(completedAt, assignment.dueDate) : '',
          ])
        );
      }
    }
  }

  return rows.join('\r\n');
}

export function downloadCsvFile(filename: string, csvContent: string): void {
  const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
