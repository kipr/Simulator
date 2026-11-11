import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 4'),
  description: tr('Botball Explorer Mission 4: Remove the Hazard'),
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
    orangePomNotTouchBlackLine: {
      name: tr('Orange Pom Not Touch Black Line'),
      description: tr('Orange Pom did not touch the black line'),
    },
    bluePomNotTouchBlackLine: {
      name: tr('Blue Pom Not Touch Black Line'),
      description: tr('Blue Pom did not touch the black line'),
    },
    bonus: {
      name: tr('Bonus'),
      description: tr('Both an Orange Pom and a Blue Pom did not touch the black line'),
    }
  },
  success: {
    exprs: {
      orangePomNotTouchBlackLine: {
        type: Expr.Type.Event,
        eventId: 'orangePomNotTouchBlackLine',
      },
      orangePomNotTouchBlackLineOnce: {
        type: Expr.Type.Once,
        argId: 'orangePomNotTouchBlackLine',
      },
      bonus: {
        type: Expr.Type.Event,
        eventId: 'bonus',
      },
      completion: {
        type: Expr.Type.And,
        argIds: ['orangePomNotTouchBlackLineOnce'],
      },
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
      exprId: 'orangePomNotTouchBlackLine',
      name: tr('Orange Pom Not Touch Black Line'),
    },
    {
      exprId: 'bonus',
      name: tr('Both an Orange Pom and a Blue Pom did not touch the black line'),
    }
  ],
  failureGoals: [

  ],

  sceneId: 'bex4'

} as Challenge;