import LocalizedString from './LocalizedString';
import Dict from './objectOps/Dict';

/** Human-readable classroom name for UI and leave confirmation (handles localized Firestore values). */
export function classroomNameAsString(
  classroomId: string | Dict<string> | unknown,
  locale: LocalizedString.Language = LocalizedString.EN_US
): string {
  if (typeof classroomId === 'string') {
    return classroomId.trim();
  }
  if (classroomId && typeof classroomId === 'object' && !Array.isArray(classroomId)) {
    return LocalizedString.lookup(classroomId as LocalizedString, locale).trim();
  }
  return String(classroomId ?? '').trim();
}

export function normalizeClassroomNameForCompare(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function classroomNamesMatch(entered: string, expected: string): boolean {
  const a = normalizeClassroomNameForCompare(entered);
  const b = normalizeClassroomNameForCompare(expected);
  return (
    a.length > 0 &&
    b.length > 0 &&
    a.localeCompare(b, undefined, { sensitivity: 'base' }) === 0
  );
}
