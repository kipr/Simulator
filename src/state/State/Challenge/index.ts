import Author from '../../../db/Author';
import Dict from '../../../Dict';
import ProgrammingLanguage from '../../../ProgrammingLanguage';
import LocalizedString from '../../../util/LocalizedString';
import Async from '../Async';
import Event from './Event';
import Predicate from './Predicate';

interface Challenge {
  name: LocalizedString;
  description: LocalizedString;
  author: Author;

  code: { [language in ProgrammingLanguage]: string };
  defaultLanguage: ProgrammingLanguage;

  events: Dict<Event>;

  success?: Predicate;
  failure?: Predicate;

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