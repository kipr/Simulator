import Dict from '../../../util/objectOps/Dict';
import Async from '../Async';
import PredicateCompletion from '../ChallengeCompletion/PredicateCompletion';

import ProgrammingLanguage from '../../../programming/compiler/ProgrammingLanguage';
import { ReferenceFramewUnits } from '../../../util/math/unitMath';

interface LimitedChallengeCompletion {
  code: { [language in ProgrammingLanguage]?: string };
  currentLanguage: ProgrammingLanguage;
  serializedSceneDiff: string;
  robotLinkOrigins?: Dict<Dict<ReferenceFramewUnits>>;
  eventStates: Dict<boolean>;
  success?: PredicateCompletion;
  failure?: PredicateCompletion;

  /**
   * ISO 8601 timestamp when the user first successfully completed the challenge.
   * This is only set once and used for tie-breaking on the leaderboard.
   */
  bestCompletionTime?: string;

  /**
   * Wall-clock milliseconds from when the user clicked Run to when the success condition was met.
   */
  bestRuntimeMs?: number;

  /**
   * The program code that achieved the best runtime.
   */
  bestProgram?: string;

  /**
   * The programming language of the best program.
   */
  bestProgramLanguage?: ProgrammingLanguage;

  /**
   * User's display name (denormalized for leaderboard display).
   * This is automatically set by the backend from the Firebase token.
   */
  displayName?: string;
}

namespace LimitedChallengeCompletion {
  export const EMPTY: LimitedChallengeCompletion = {
    code: {
      c: '',
      cpp: '',
      python: '',
    },
    currentLanguage: 'c',
    serializedSceneDiff: JSON.stringify({ t: 'o' }),
    eventStates: {},
  };
}


export interface LimitedChallengeCompletionBrief {
  bestCompletionTime?: string;
  bestRuntimeMs?: number;
}

export namespace LimitedChallengeCompletionBrief {
  export const fromCompletion = (completion: LimitedChallengeCompletion): LimitedChallengeCompletionBrief => ({
    bestCompletionTime: completion.bestCompletionTime,
    bestRuntimeMs: completion.bestRuntimeMs,
  });
}

export type AsyncLimitedChallengeCompletion = Async<LimitedChallengeCompletionBrief, LimitedChallengeCompletion>;

export namespace AsyncLimitedChallengeCompletion {
  export const unloaded = (brief: LimitedChallengeCompletionBrief): AsyncLimitedChallengeCompletion => ({
    type: Async.Type.Unloaded,
    brief,
  });

  export const loaded = (completion: LimitedChallengeCompletion): AsyncLimitedChallengeCompletion => ({
    type: Async.Type.Loaded,
    brief: {
      bestCompletionTime: completion.bestCompletionTime,
      bestRuntimeMs: completion.bestRuntimeMs,
    },
    value: completion,
  });
}

export default LimitedChallengeCompletion;
