import Author from '../../../db/Author';
import Dict from '../../../util/objectOps/Dict';
import ProgrammingLanguage from '../../../programming/compiler/ProgrammingLanguage';
import LocalizedString from '../../../util/LocalizedString';
import Async from '../Async';
import Event from '../Challenge/Event';
import Predicate from '../Challenge/Predicate';

export interface Goal {
  /**
   * Expression identifier within the predicate that this goal represents.
   */
  exprId: string;
  /**
   * Localized label shown in the goal list.
   */
  name: LocalizedString;
}

interface LimitedChallenge {
  name: LocalizedString;
  description: LocalizedString;
  author: Author;

  code: { [language in ProgrammingLanguage]?: string };
  defaultLanguage: ProgrammingLanguage;

  events: Dict<Event>;

  success?: Predicate;
  failure?: Predicate;

  /**
   * Optional listing of high-level success goals. Each goal references an
   * expression in the success predicate by id so that the underlying predicate
   * tree can be simplified for display.
   */
  successGoals?: Goal[];
  /**
   * Optional listing of high-level failure goals. Each goal references an
   * expression in the failure predicate by id.
   */
  failureGoals?: Goal[];

  sceneId: string;

  /**
   * ISO 8601 timestamp when the challenge becomes available.
   */
  openDate: string;

  /**
   * ISO 8601 timestamp when the challenge closes.
   */
  closeDate: string;
}

export interface LimitedChallengeBrief {
  name: LocalizedString;
  description: LocalizedString;
  author: Author;
  openDate: string;
  closeDate: string;
}

export namespace LimitedChallengeBrief {
  export const fromChallenge = (challenge: LimitedChallenge): LimitedChallengeBrief => ({
    name: challenge.name,
    description: challenge.description,
    author: challenge.author,
    openDate: challenge.openDate,
    closeDate: challenge.closeDate,
  });
}

export type AsyncLimitedChallenge = Async<LimitedChallengeBrief, LimitedChallenge>;

export namespace AsyncLimitedChallenge {
  export const unloaded = (brief: LimitedChallengeBrief): AsyncLimitedChallenge => ({
    type: Async.Type.Unloaded,
    brief,
  });

  export const loaded = (challenge: LimitedChallenge): AsyncLimitedChallenge => ({
    type: Async.Type.Loaded,
    brief: {
      name: challenge.name,
      description: challenge.description,
      author: challenge.author,
      openDate: challenge.openDate,
      closeDate: challenge.closeDate,
    },
    value: challenge,
  });
}

/**
 * Status of a limited challenge based on current time.
 */
export type LimitedChallengeStatus = 'upcoming' | 'open' | 'closed';

export namespace LimitedChallengeStatus {
  export const fromChallenge = (challenge: LimitedChallenge): LimitedChallengeStatus => {
    const now = Date.now();
    const open = new Date(challenge.openDate).getTime();
    const close = new Date(challenge.closeDate).getTime();

    if (now < open) return 'upcoming';
    if (now > close) return 'closed';
    return 'open';
  };

  export const fromBrief = (brief: LimitedChallengeBrief): LimitedChallengeStatus => {
    const now = Date.now();
    const open = new Date(brief.openDate).getTime();
    const close = new Date(brief.closeDate).getTime();

    if (now < open) return 'upcoming';
    if (now > close) return 'closed';
    return 'open';
  };
}

export default LimitedChallenge;
