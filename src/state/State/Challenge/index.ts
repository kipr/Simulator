import Author from '../../../db/Author';
import Dict from '../../../Dict';
import LocalizedString from '../../../util/LocalizedString';
import Reference from '../../../util/Reference';
import Async from '../Async';
import Scene from '../Scene';
import Event from './Event';
import Expr from './Expr';

interface Challenge {
  name: LocalizedString;
  description: LocalizedString;
  author: Author;

  events: Dict<Event>;

  successPredicate?: Expr;
  failurePredicate?: Expr;

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