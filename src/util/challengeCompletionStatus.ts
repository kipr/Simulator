import Dict from './objectOps/Dict';

/** Raw completion from gradebook / Firestore (same shape as teacher submission view). */
type ProgressLike = unknown;

export type CompletionVersusDue = 'on-time' | 'late' | 'no-deadline' | 'unknown';

export function isChallengeCompletionSuccessful(progress: ProgressLike): boolean {
  if (!progress || typeof progress !== 'object') return false;
  const p = progress as {
    success?: { exprStates?: { completion?: boolean } };
    failure?: { exprStates?: { failure?: boolean } };
  };
  const completed = p.success?.exprStates?.completion ?? false;
  const failed = p.failure?.exprStates?.failure ?? false;
  return completed && !failed;
}

/** ISO time from persisted completion (standard or limited challenges). */
export function completionTimestampFromProgress(progress: ProgressLike): string | undefined {
  if (!progress || typeof progress !== 'object') return undefined;
  const p = progress as { completedAt?: string; bestCompletionTime?: string };
  if (typeof p.completedAt === 'string') return p.completedAt;
  if (typeof p.bestCompletionTime === 'string') return p.bestCompletionTime;
  return undefined;
}

export function countCompletedAssignmentChallenges(
  assignment: { challenges?: Dict<{ challenge: { sceneId: string } }> },
  progressBySceneId: Dict<unknown> | null | undefined
): { completed: number; total: number } {
  const list = assignment.challenges ? Object.values(assignment.challenges) : [];
  const total = list.length;
  if (total === 0 || !progressBySceneId) {
    return { completed: 0, total };
  }
  let completed = 0;
  for (const entry of list) {
    const sceneId = entry.challenge.sceneId;
    if (isChallengeCompletionSuccessful(progressBySceneId[sceneId])) {
      completed += 1;
    }
  }
  return { completed, total };
}

/**
 * When every assignment challenge is successfully completed, compare the latest
 * completion timestamp among them to the assignment due date.
 */
export function assignmentCompletionVersusDueDate(
  assignment: {
    challenges?: Dict<{ challenge: { sceneId: string } }>;
    dueDate?: string;
  },
  progressBySceneId: Dict<unknown> | null | undefined
): CompletionVersusDue {
  const list = assignment.challenges ? Object.values(assignment.challenges) : [];
  const total = list.length;
  if (total === 0 || !progressBySceneId) return 'unknown';

  let completed = 0;
  let maxMs = -Infinity;
  for (const entry of list) {
    const prog = progressBySceneId[entry.challenge.sceneId];
    if (!isChallengeCompletionSuccessful(prog)) continue;
    completed += 1;
    const stamp = completionTimestampFromProgress(prog);
    if (stamp) {
      const ms = new Date(stamp).getTime();
      if (!Number.isNaN(ms)) maxMs = Math.max(maxMs, ms);
    }
  }
  if (completed < total) return 'unknown';
  if (maxMs === -Infinity) return 'unknown';
  return completionVersusDueDate(new Date(maxMs).toISOString(), assignment.dueDate);
}

/**
 * Compare first successful completion time to assignment due.
 * `dueDate` uses the same strings as classroom assignments ("No Due Date" or ISO from datetime-local).
 */
export function completionVersusDueDate(
  completedAtIso: string | undefined,
  assignmentDueDate: string | undefined
): CompletionVersusDue {
  if (!completedAtIso) return 'unknown';
  if (!assignmentDueDate || assignmentDueDate === 'No Due Date') return 'no-deadline';
  const doneMs = new Date(completedAtIso).getTime();
  const dueMs = new Date(assignmentDueDate).getTime();
  if (Number.isNaN(doneMs) || Number.isNaN(dueMs)) return 'unknown';
  return doneMs <= dueMs ? 'on-time' : 'late';
}

const pillBase = {
  borderRadius: '999px',
  padding: '2px 9px',
  fontSize: '0.72em',
  fontWeight: 600 as const,
  display: 'inline-block' as const,
  marginTop: '4px',
};

export const completionDuePillStyle: Record<
Exclude<CompletionVersusDue, 'unknown'>,
  typeof pillBase & { backgroundColor: string; color: string; border: string }
> = {
  'on-time': {
    ...pillBase,
    backgroundColor: 'rgba(76, 175, 80, 0.22)',
    color: '#c8e6c9',
    border: '1px solid rgba(102, 187, 106, 0.85)',
  },
  late: {
    ...pillBase,
    backgroundColor: 'rgba(239, 83, 80, 0.18)',
    color: '#ffccbc',
    border: '1px solid rgba(229, 115, 115, 0.85)',
  },
  'no-deadline': {
    ...pillBase,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: 'rgba(255, 255, 255, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
};
