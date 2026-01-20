/**
 * Represents a single entry in the limited challenge leaderboard.
 */
export interface LeaderboardEntry {
  /**
   * User's unique identifier.
   */
  uid: string;

  /**
   * User's display name for the leaderboard.
   */
  displayName: string;

  /**
   * Wall-clock milliseconds from when the user clicked Run to when the success condition was met.
   */
  bestRuntimeMs: number;

  /**
   * ISO 8601 timestamp when the best completion was achieved.
   */
  bestCompletionTime: string;
}

/**
 * Sort field options for the leaderboard.
 */
export type LeaderboardSortField = 'completionTime' | 'runtime';

export namespace LeaderboardEntry {
  /**
   * Compare two entries by completion time (oldest first).
   */
  export const compareByCompletionTime = (a: LeaderboardEntry, b: LeaderboardEntry): number => {
    return new Date(a.bestCompletionTime).getTime() - new Date(b.bestCompletionTime).getTime();
  };

  /**
   * Compare two entries by runtime (fastest first).
   */
  export const compareByRuntime = (a: LeaderboardEntry, b: LeaderboardEntry): number => {
    return a.bestRuntimeMs - b.bestRuntimeMs;
  };

  /**
   * Sort entries based on the specified field.
   */
  export const sort = (entries: LeaderboardEntry[], field: LeaderboardSortField): LeaderboardEntry[] => {
    const sorted = [...entries];
    switch (field) {
      case 'completionTime':
        return sorted.sort(compareByCompletionTime);
      case 'runtime':
        return sorted.sort(compareByRuntime);
    }
  };
}

/**
 * Context about the current user's position in the leaderboard.
 */
export interface LeaderboardUserContext {
  /**
   * User's 1-based position in the leaderboard.
   */
  rank: number;

  /**
   * Entries immediately above the user (faster times), ordered fastest to slowest.
   * Empty if user is in the top N.
   */
  entriesAbove: LeaderboardEntry[];

  /**
   * The current user's leaderboard entry.
   */
  userEntry: LeaderboardEntry;

  /**
   * Entries immediately below the user (slower times), ordered fastest to slowest.
   */
  entriesBelow: LeaderboardEntry[];
}

/**
 * Response shape for the /leaderboard/around-me endpoint.
 * Provides top entries plus context around the current user's position.
 */
export interface LeaderboardAroundMeResponse {
  /**
   * Top N entries in the leaderboard (always included).
   */
  topEntries: LeaderboardEntry[];

  /**
   * Context about the current user's position.
   * Undefined if the user has no completion for this challenge.
   */
  userContext?: LeaderboardUserContext;

  /**
   * Total number of participants with valid completions.
   */
  totalParticipants: number;
}
