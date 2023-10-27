import Dict from '../../../Dict';
import Async from '../Async';


import ProgrammingLanguage from '../../../ProgrammingLanguage';
import { ReferenceFrame } from '../../../unit-math';

interface AccountAuthorization {
  code: { [language in ProgrammingLanguage]: string };
  currentLanguage: ProgrammingLanguage;
  serializedSceneDiff: string;
  robotLinkOrigins?: Dict<Dict<ReferenceFrame>>;
  eventStates: Dict<boolean>;
  
}

namespace AccountAuthorization {
  export const EMPTY: AccountAuthorization = {
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


export interface AccountAuthorizationBrief {
}

export namespace AccountAuthorizationBrief {
}

export type AsyncAccountAuthorization = Async<AccountAuthorizationBrief, AccountAuthorization>;

export namespace AsyncAccount {
  export const unloaded = (brief: AccountAuthorizationBrief): AsyncAccountAuthorization => ({
    type: Async.Type.Unloaded,
    brief,
  });

  export const loaded = (account: AccountAuthorization): AsyncAccountAuthorization => ({
    type: Async.Type.Loaded,
    brief: {
    },
    value: account,
  });
}

export default AccountAuthorization;