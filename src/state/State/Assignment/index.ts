import Author from '../../../db/Author';
import LocalizedString from '../../../util/LocalizedString';
import Subject from './Subject';

import tr from '@i18n';
import Dict from '../../../Dict';
import Async from '../Async';

interface Assignment {
  author: Author;

  name: LocalizedString;

  standardsConformance: StandardsLocation[];

  gradeLevels: number[];

  subjects: Subject[];

  educatorNotes: LocalizedString;
  studentNodes: LocalizedString;

  assets: Dict<string>;
}

export type AssignmentBrief = Pick<Assignment, 'author' | 'name' | 'gradeLevels' | 'subjects'>;

namespace Assignment {
  /**
   * Convert a grade level number to a string. 0 is kindergarten, 1 is first grade, etc.
   * @param gradeLevel The grade level
   * @returns The string
   */
  export const gradeLevelString = (gradeLevel: number) => {
    switch (gradeLevel) {
      case 0: return tr('Kindergarten');
      case 1: return tr('1st grade');
      case 2: return tr('2nd grade');
      case 3: return tr('3rd grade');
      case 4: return tr('4th grade');
      case 5: return tr('5th grade');
      case 6: return tr('6th grade');
      case 7: return tr('7th grade');
      case 8: return tr('8th grade');
      case 9: return tr('9th grade');
      case 10: return tr('10th grade');
      case 11: return tr('11th grade');
      case 12: return tr('12th grade');
    }
  };

  export const gradeLevelAbbreviatedString = (gradeLevel: number) => {
    switch (gradeLevel) {
      case 0: return tr('K');
      case 1: return tr('1st');
      case 2: return tr('2nd');
      case 3: return tr('3rd');
      case 4: return tr('4th');
      case 5: return tr('5th');
      case 6: return tr('6th');
      case 7: return tr('7th');
      case 8: return tr('8th');
      case 9: return tr('9th');
      case 10: return tr('10th');
      case 11: return tr('11th');
      case 12: return tr('12th');
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
