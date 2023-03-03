import Dict from '../../../Dict';
import Async from '../Async';
import PredicateCompletion from './PredicateCompletion';

import ProgrammingLanguage from '../../../ProgrammingLanguage';
import { ReferenceFrame } from '../../../unit-math';

interface ChallengeCompletion {
  code: { [language in ProgrammingLanguage]: string };
  currentLanguage: ProgrammingLanguage;
  serializedSceneDiff: string;
  robotLinkOrigins?: Dict<Dict<ReferenceFrame>>;
  eventStates: Dict<boolean>;
  success?: PredicateCompletion;
  failure?: PredicateCompletion;
}

namespace ChallengeCompletion {
  export const EMPTY: ChallengeCompletion = {
    code: {
      'c': '',
      'cpp': '',
      'python': '',
    },
    currentLanguage: 'c',
    serializedSceneDiff: JSON.stringify({ t: 'o' }),
    eventStates: {},
  };
}


export interface ChallengeCompletionBrief {
}

export namespace ChallengeCompletionBrief {
}

export type AsyncChallengeCompletion = Async<ChallengeCompletionBrief, ChallengeCompletion>;

export namespace AsyncChallenge {
  export const unloaded = (brief: ChallengeCompletionBrief): AsyncChallengeCompletion => ({
    type: Async.Type.Unloaded,
    brief,
  });

  export const loaded = (challenge: ChallengeCompletion): AsyncChallengeCompletion => ({
    type: Async.Type.Loaded,
    brief: {
    },
    value: challenge,
  });
}

export default ChallengeCompletion;