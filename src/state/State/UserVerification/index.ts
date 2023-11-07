import Dict from '../../../Dict';
import Async from '../Async';


import ProgrammingLanguage from '../../../ProgrammingLanguage';
import { ReferenceFrame } from '../../../unit-math';

interface UserVerification {
  code: { [language in ProgrammingLanguage]: string };
  currentLanguage: ProgrammingLanguage;
  serializedSceneDiff: string;
  robotLinkOrigins?: Dict<Dict<ReferenceFrame>>;
  eventStates: Dict<boolean>;
  
}

namespace UserVerification {
  export const EMPTY: UserVerification = {
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


export interface UserVerificationBrief {
}

export namespace UserVerificationBrief {
}

export type AsyncUserVerification = Async<UserVerificationBrief, UserVerification>;

export namespace AsyncAccount {
  export const unloaded = (brief: UserVerificationBrief): AsyncUserVerification => ({
    type: Async.Type.Unloaded,
    brief,
  });

  export const loaded = (account: UserVerification): AsyncUserVerification => ({
    type: Async.Type.Loaded,
    brief: {
    },
    value: account,
  });
}

export default UserVerification;