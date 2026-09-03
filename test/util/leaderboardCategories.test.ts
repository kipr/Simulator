import * as fs from 'fs';
import * as path from 'path';
import {
  LEADERBOARD_CATEGORIES,
  categoryForChallengeId,
  challengeIdsForCategory,
  rankUsersForCategory,
  scoresForCategory,
} from '../../src/util/leaderboardCategories';

describe('leaderboard challenge categories', () => {
  test('exposes the requested categories in display order', () => {
    expect(LEADERBOARD_CATEGORIES.map(category => [category.id, category.label['en-US']])).toEqual([
      ['jbc', 'Junior Botball Challenge (JBC)'],
      ['bex26', 'Botball Explorer 2026'],
      ['gcer25', 'GCER 2025'],
    ]);
  });

  test('stays synchronized with the challenge definition directories', () => {
    const definitionsRoot = path.resolve(__dirname, '../../src/simulator/definitions/challenges');
    const categoryIds = new Map(
      LEADERBOARD_CATEGORIES.map(category => [category.id, [...category.challengeIds]])
    );
    const numericIdSort = (a: string, b: string) => {
      return Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]);
    };

    const jbcIds = fs.readdirSync(definitionsRoot, { withFileTypes: true })
      .filter(entry => entry.isFile() && /^jbc\d+-.*\.ts$/.test(entry.name))
      .map(entry => entry.name.match(/^(jbc\d+)-/)?.[1])
      .filter((challengeId): challengeId is string => Boolean(challengeId))
      .sort(numericIdSort);
    const bexIds = fs.readdirSync(path.join(definitionsRoot, 'bex26'))
      .map(fileName => fileName.match(/^(bex\d+)-/)?.[1])
      .filter((challengeId): challengeId is string => Boolean(challengeId))
      .sort(numericIdSort);
    const gcerIds = fs.readdirSync(path.join(definitionsRoot, 'gcer25'))
      .sort()
      .map(fileName => fs.readFileSync(path.join(definitionsRoot, 'gcer25', fileName), 'utf8'))
      .map(source => source.match(/sceneId:\s*['"]([^'"]+)['"]/)?.[1])
      .filter((challengeId): challengeId is string => Boolean(challengeId));

    expect(categoryIds.get('jbc')).toEqual(jbcIds);
    expect(categoryIds.get('bex26')).toEqual(bexIds);
    expect(categoryIds.get('gcer25')).toEqual(gcerIds);
  });

  test('classifies current scene ids and excludes archived, custom, and unknown ids', () => {
    expect(categoryForChallengeId('jbc0')).toBe('jbc');
    expect(categoryForChallengeId('jbc24')).toBe('jbc');
    expect(categoryForChallengeId('bex18')).toBe('bex26');
    expect(categoryForChallengeId('Find_The_Black_Line')).toBe('gcer25');
    expect(categoryForChallengeId('jbc13')).toBeUndefined();
    expect(categoryForChallengeId('jbc2b')).toBeUndefined();
    expect(categoryForChallengeId('custom-123')).toBeUndefined();
    expect(categoryForChallengeId('future-challenge')).toBeUndefined();
  });

  test('filters and orders category challenges according to their definition order', () => {
    expect(challengeIdsForCategory(['bex10', 'jbc2', 'bex2', 'unknown'], 'bex26')).toEqual([
      'bex2',
      'bex10',
    ]);
    expect(challengeIdsForCategory([
      'Thirst_Quencher',
      'Bulldozer_Mania',
      'jbc0',
    ], 'gcer25')).toEqual(['Bulldozer_Mania', 'Thirst_Quencher']);
  });

  test('ranks only participants in the selected category', () => {
    const users = {
      one: {
        id: 'one',
        scores: [
          { challengeId: 'jbc0', completed: true },
          { challengeId: 'jbc1', completed: false },
          { challengeId: 'bex1', completed: true },
        ],
      },
      two: {
        id: 'two',
        scores: [
          { challengeId: 'jbc0', completed: true },
          { challengeId: 'jbc1', completed: true },
        ],
      },
      three: {
        id: 'three',
        scores: [{ challengeId: 'bex2', completed: false }],
      },
      unknown: {
        id: 'unknown',
        scores: [{ challengeId: 'custom-123', completed: true }],
      },
    };

    expect(rankUsersForCategory(users, 'jbc').map(user => user.id)).toEqual(['two', 'one']);
    expect(rankUsersForCategory(users, 'bex26').map(user => user.id)).toEqual(['one', 'three']);
    expect(rankUsersForCategory(users, 'gcer25')).toEqual([]);
  });

  test('selects active-category export scores in challenge order', () => {
    const scores = [
      { challengeId: 'bex10', completed: false, label: 'ten' },
      { challengeId: 'jbc0', completed: true, label: 'jbc' },
      { challengeId: 'bex2', completed: true, label: 'two' },
    ];

    expect(scoresForCategory(scores, 'bex26').map(score => score.label)).toEqual(['two', 'ten']);
    expect(scoresForCategory(scores, 'gcer25')).toEqual([]);
  });
});
