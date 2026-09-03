import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 5'),
  description: tr('Botball Explorer Mission 5: Top Shelf Delivery'),
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
    smallRedOnLargeRed: {
      name: tr('Small Red Cube on Large Red Cube'),
      description: tr('Small Red Cube stacked on Large Red Cube'),
    },

    bonus: {
      name: tr('Bonus: Both Small Red Cubes stacked on Large Red Cube'),
      description: tr('Both Small Red Cubes stacked on Large Red Cube'),
    }

  },
  success: {
    exprs: {
      smallRedOnLargeRed: {
        type: Expr.Type.Event,
        eventId: 'smallRedOnLargeRed',
      },
      smallRedOnLargeRedOnce: {
        type: Expr.Type.Once,
        argId: 'smallRedOnLargeRed',
      },
      bonus: {
        type: Expr.Type.Event,
        eventId: 'bonus',
      },
      bonusOnce: {
        type: Expr.Type.Once,
        argId: 'bonus',
      },
      completion: {
        type: Expr.Type.And,
        argIds: ['smallRedOnLargeRedOnce'],
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
      exprId: 'smallRedOnLargeRedOnce',
      name: tr('Small Red Cube stacked on Large Red Cube'),
    },
    {
      exprId: 'bonusOnce',
      name: tr('Both Small Red Cubes stacked on Large Red Cube'),
    }
  ],
  failureGoals: [

  ],
  sceneId: 'bex5'

} as Challenge;