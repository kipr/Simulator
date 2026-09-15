import tr from '@i18n';
import LocalizedString from './LocalizedString';

export type LeaderboardCategoryId = 'jbc' | 'bex26' | 'gcer25';

export interface LeaderboardCategory {
  id: LeaderboardCategoryId;
  label: LocalizedString;
  challengeIds: readonly string[];
}

const JBC_CHALLENGE_IDS = [
  'jbc0', 'jbc1', 'jbc2', 'jbc3', 'jbc4', 'jbc5', 'jbc6', 'jbc7', 'jbc8', 'jbc9',
  'jbc10', 'jbc11', 'jbc12', 'jbc14', 'jbc15', 'jbc16', 'jbc17', 'jbc18', 'jbc19',
  'jbc20', 'jbc21', 'jbc22', 'jbc23', 'jbc24',
] as const;

const BEX26_CHALLENGE_IDS = [
  'bex1', 'bex2', 'bex3', 'bex4', 'bex5', 'bex6', 'bex7', 'bex8', 'bex9',
  'bex10', 'bex11', 'bex12', 'bex13', 'bex14', 'bex15', 'bex16', 'bex17', 'bex18',
] as const;

const GCER25_CHALLENGE_IDS = [
  'Bulldozer_Mania',
  'Cover_Your_Bases',
  'Entree_Express',
  'Find_The_Black_Line',
  'Ice_Ice_Botguy',
  'Mountain_Rescue',
  'Odd_Numbers',
  'Sense_The_Can',
  'Special_Sauce',
  'Thirst_Quencher',
] as const;

export const LEADERBOARD_CATEGORIES: readonly LeaderboardCategory[] = [
  {
    id: 'jbc',
    label: tr('Junior Botball Challenge (JBC)'),
    challengeIds: JBC_CHALLENGE_IDS,
  },
  {
    id: 'bex26',
    label: tr('Botball Explorer 2026'),
    challengeIds: BEX26_CHALLENGE_IDS,
  },
  {
    id: 'gcer25',
    label: tr('GCER 2025'),
    challengeIds: GCER25_CHALLENGE_IDS,
  },
];

const CATEGORY_BY_CHALLENGE_ID = LEADERBOARD_CATEGORIES.reduce(
  (categories, category) => {
    for (const challengeId of category.challengeIds) categories.set(challengeId, category.id);
    return categories;
  },
  new Map<string, LeaderboardCategoryId>()
);

const CHALLENGE_ORDER_BY_CATEGORY = LEADERBOARD_CATEGORIES.reduce(
  (orders, category) => {
    orders.set(
      category.id,
      new Map(category.challengeIds.map((challengeId, index) => [challengeId, index]))
    );
    return orders;
  },
  new Map<LeaderboardCategoryId, Map<string, number>>()
);

export interface LeaderboardCategoryScore {
  challengeId: string;
  completed: boolean;
}

export interface LeaderboardCategoryUser {
  scores: readonly LeaderboardCategoryScore[];
}

export function categoryForChallengeId(challengeId: string): LeaderboardCategoryId | undefined {
  return CATEGORY_BY_CHALLENGE_ID.get(challengeId);
}

export function challengeBelongsToCategory(
  challengeId: string,
  categoryId: LeaderboardCategoryId
): boolean {
  return categoryForChallengeId(challengeId) === categoryId;
}

export function challengeIdsForCategory(
  challengeIds: readonly string[],
  categoryId: LeaderboardCategoryId
): string[] {
  const order = CHALLENGE_ORDER_BY_CATEGORY.get(categoryId);
  return challengeIds
    .filter(challengeId => challengeBelongsToCategory(challengeId, categoryId))
    .sort((a, b) => (order?.get(a) ?? Number.MAX_SAFE_INTEGER) - (order?.get(b) ?? Number.MAX_SAFE_INTEGER));
}

export function scoresForCategory<T extends LeaderboardCategoryScore>(
  scores: readonly T[],
  categoryId: LeaderboardCategoryId
): T[] {
  const scoreIds = challengeIdsForCategory(scores.map(score => score.challengeId), categoryId);
  const scoresById = new Map(scores.map(score => [score.challengeId, score]));
  return scoreIds.map(challengeId => scoresById.get(challengeId)).filter((score): score is T => Boolean(score));
}

export function rankUsersForCategory<T extends LeaderboardCategoryUser>(
  users: Record<string, T>,
  categoryId: LeaderboardCategoryId
): T[] {
  const rankScore = (user: LeaderboardCategoryUser): number => {
    return user.scores.reduce(
      (total, score) => {
        if (!challengeBelongsToCategory(score.challengeId, categoryId)) return total;
        return total + (score.completed ? 101 : 1);
      },
      0
    );
  };

  return Object.values(users)
    .filter(user => user.scores.some(score => challengeBelongsToCategory(score.challengeId, categoryId)))
    .sort((a, b) => rankScore(b) - rankScore(a));
}
