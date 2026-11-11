import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 11'),
  description: tr('Botball Explorer Mission 11: Hazard Disposal'),
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
    orangePomInBasket: {
      name: tr('Orange Pom in Basket'),
      description: tr('One orange pom in the basket')
    },
    bonus: {
      name: tr('Bonus'),
      description: tr('2 or more orange poms are in the basket')
    }
  },
  success: {
    exprs: {

      orangePomInBasket: {
        type: Expr.Type.Event,
        eventId: 'orangePomInBasket',
      },
      bonus: {
        type: Expr.Type.Event,
        eventId: 'bonus',
      },
      completion: {
        type: Expr.Type.And,
        argIds: ['orangePomInBasket'],
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
      exprId: 'orangePomInBasket',
      name: tr('One Orange Pom in Basket'),
    },
    {
      exprId: 'bonus',
      name: tr('Bonus: 2 or more Orange Poms in Basket'),
    }
  ],
  failureGoals: [

  ],
  sceneId: 'bex11'

} as Challenge;