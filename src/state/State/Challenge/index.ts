import Author from '../../../db/Author';
import Dict from '../../../util/objectOps/Dict';
import ProgrammingLanguage from '../../../programming/compiler/ProgrammingLanguage';
import LocalizedString from '../../../util/LocalizedString';
import Async from '../Async';
import Event from './Event';
import Predicate from './Predicate';

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

interface Challenge {
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
}

export interface ChallengeBrief {
  name: LocalizedString;
  description: LocalizedString;
  author: Author;
}

export namespace ChallengeBrief {
  export const fromChallenge = (challenge: Challenge): ChallengeBrief => ({
    name: challenge.name,
    description: challenge.description,
    author: challenge.author,
  });
}

export type AsyncChallenge = Async<ChallengeBrief, Challenge>;

export namespace AsyncChallenge {
  export const unloaded = (brief: ChallengeBrief): AsyncChallenge => ({
    type: Async.Type.Unloaded,
    brief,
  });

  export const loaded = (challenge: Challenge): AsyncChallenge => ({
    type: Async.Type.Loaded,
    brief: {
      name: challenge.name,
      description: challenge.description,
      author: challenge.author,
    },
    value: challenge,
  });
}

export default Challenge;