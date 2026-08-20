import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 15'),
  description: tr('Botball Explorer Mission 15: Hazard Disposal #2'),
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
  sceneId: 'bex15'

} as Challenge;