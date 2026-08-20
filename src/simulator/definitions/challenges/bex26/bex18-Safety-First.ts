import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 18'),
  description: tr('Botball Explorer Mission 18: Safety First, All Hands on Deck'),
  author: {
    type: Author.Type.Organization,
    id: 'kipr',
  },
  code: {
    'c': ProgrammingLanguage.DEFAULT_CODE.c,
    'cpp': ProgrammingLanguage.DEFAULT_CODE.cpp,
    'python': ProgrammingLanguage.DEFAULT_CODE.python,
  },
  defaultLanguage: 'c',
  events: {

  },
  success: {
    exprs: {
    },
    rootId: 'completion',
  },
  failure: {
    exprs: {

    },
    rootId: 'failure',
  },
  successGoals: [

  ],
  failureGoals: [

  ],
  sceneId: 'bex18'

} as Challenge;