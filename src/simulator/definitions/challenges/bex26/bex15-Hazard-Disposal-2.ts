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
    bluePomInBasket: {
      name: tr('Blue Pom in Basket'),
      description: tr('One blue pom in the basket')
    },
    bonus: {
      name: tr('Bonus'),
      description: tr('2 or more blue poms are in the basket')
    }
  },
  success: {
    exprs: {

      bluePomInBasket: {
        type: Expr.Type.Event,
        eventId: 'bluePomInBasket',
      },
      bonus: {
        type: Expr.Type.Event,
        eventId: 'bonus',
      },
      completion: {
        type: Expr.Type.And,
        argIds: ['bluePomInBasket'],
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
      exprId: 'bluePomInBasket',
      name: tr('One Blue Pom in Basket'),
    },
    {
      exprId: 'bonus',
      name: tr('Bonus: 2 or more Blue Poms in Basket'),
    }
  ],
  failureGoals: [

  ],
  sceneId: 'bex15'

} as Challenge;