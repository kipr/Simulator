import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 14'),
  description: tr('Botball Explorer Mission 14: Traffic Control'),
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
    bothConesOffBlackLine: {
      name: tr('Both Cones Off Black Line'),
      description: tr('Both cones are off the black line')
    },
    bonus: {
      name: tr('Bonus'),
      description: tr('One cone is in the Loading Zone')
    }
  },
  success: {
    exprs: {
      bothConesOffBlackLine: {
        type: Expr.Type.Event,
        eventId: 'bothConesOffBlackLine',
      },

      bonus: {
        type: Expr.Type.Event,
        eventId: 'bonus',
      },
      completion: {
        type: Expr.Type.And,
        argIds: ['bothConesOffBlackLine'],
      }
    },
    rootId: 'completion',
  },
  failure: {
    exprs: {

    },
    rootId: 'failure',
  },
  successGoals: [
    {
      exprId: 'bothConesOffBlackLine',
      name: tr('Both Cones Off Black Line'),
    },
    {
      exprId: 'bonus',
      name: tr('One Cone in Loading Zone'),
    }
  ],
  failureGoals: [

  ],
  sceneId: 'bex14'

} as Challenge;