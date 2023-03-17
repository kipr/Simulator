import Author from '../../../db/Author';
import LocalizedString from '../../../util/LocalizedString';
import Subject from './Subject';

import tr from '@i18n';
import Dict from '../../../Dict';
import Async from '../Async';
import StandardsLocation from './StandardsLocation';

interface Assignment {
  author: Author;

  name: LocalizedString;

  standardsAligned: boolean;
  standardsConformance: StandardsLocation[];

  gradeLevels: number[];

  subjects: Subject[];

  educatorNotes: LocalizedString;
  studentNotes: LocalizedString;

  assets: Dict<string>;
}

export type AssignmentBrief = Pick<Assignment, 'author' | 'name' | 'gradeLevels' | 'subjects' | 'standardsConformance' | 'standardsAligned'>;

export namespace AssignmentBrief {
  export const fromAssignment = ({
    author,
    name,
    gradeLevels,
    subjects,
    standardsConformance,
    standardsAligned
  }: Assignment): AssignmentBrief => ({
    author,
    name,
    gradeLevels,
    subjects,
    standardsConformance,
    standardsAligned
  });
}

namespace Assignment {
  /**
   * Convert a grade level number to a string. 0 is kindergarten, 1 is first grade, etc.
   * @param gradeLevel The grade level
   * @returns The string
   */
  export const gradeLevelString = (gradeLevel: number) => {
    switch (gradeLevel) {
      case 0: return tr('Kindergarten', 'Student grade level');
      case 1: return tr('1st grade', 'Student grade level');
      case 2: return tr('2nd grade', 'Student grade level');
      case 3: return tr('3rd grade', 'Student grade level');
      case 4: return tr('4th grade', 'Student grade level');
      case 5: return tr('5th grade', 'Student grade level');
      case 6: return tr('6th grade', 'Student grade level');
      case 7: return tr('7th grade', 'Student grade level');
      case 8: return tr('8th grade', 'Student grade level');
      case 9: return tr('9th grade', 'Student grade level');
      case 10: return tr('10th grade', 'Student grade level');
      case 11: return tr('11th grade', 'Student grade level');
      case 12: return tr('12th grade', 'Student grade level');
    }
  };

  export const gradeLevelAbbreviatedString = (gradeLevel: number) => {
    switch (gradeLevel) {
      case 0: return tr('K', 'Student grade level; Kingergarten');
      case 1: return tr('1st', 'Student grade level');
      case 2: return tr('2nd', 'Student grade level');
      case 3: return tr('3rd', 'Student grade level');
      case 4: return tr('4th', 'Student grade level');
      case 5: return tr('5th', 'Student grade level');
      case 6: return tr('6th', 'Student grade level');
      case 7: return tr('7th', 'Student grade level');
      case 8: return tr('8th', 'Student grade level');
      case 9: return tr('9th', 'Student grade level');
      case 10: return tr('10th', 'Student grade level');
      case 11: return tr('11th', 'Student grade level');
      case 12: return tr('12th', 'Student grade level');
    }
  };

  export const gradeLevelRanges = (gradeLevels: Set<number>): [number, number][] => {
    const sorted = Array.from(gradeLevels).sort((a, b) => a - b);
    const ranges: [number, number][] = [];
    let start = sorted[0];
    let end = start;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push([start, end]);
        start = sorted[i];
        end = start;
      }
    }
    ranges.push([start, end]);
    return ranges;
  };
}

export type AsyncAssignment = Async<AssignmentBrief, Assignment>;

export default Assignment;
