import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';
import { GREEN } from 'components/constants/theme';


export default {
  name: tr('Botball Explorer Mission 3'),
  description: tr('Botball Explorer Mission 3: Mixed Freight'),
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
    greenCubeStackedOnYellow: {
      name: tr('Green Cube Stacked on Yellow'),
      description: tr('Green Cube stacked on Yellow Cube'),
    },
    yellowCubeStackedOnGreen: {
      name: tr('Yellow Cube Stacked on Green'),
      description: tr('Yellow Cube stacked on Green Cube'),
    },
    bonus: {
      name: tr('Bonus: Second stack consisting of Green and Yellow Cube'),
      description: tr('Either Green Cube stacked on Yellow or Yellow Cube stacked on Green'),
    },
    advancedBonus: {
      name: tr('Advanced Bonus: Both stacks consisting of Green and Yellow Cube'),
      description: tr('Both Green Cube stacked on Yellow and Yellow Cube stacked on Green'),
    }
  },
  success: {
    exprs: {
      greenCubeStackedOnYellow: {
        type: Expr.Type.Event,
        eventId: 'greenCubeStackedOnYellow',
      },
      yellowCubeStackedOnGreen: {
        type: Expr.Type.Event,
        eventId: 'yellowCubeStackedOnGreen',
      },
      bonus: {
        type: Expr.Type.Event,
        eventId: 'bonus',
      },
      advancedBonus: {
        type: Expr.Type.Event,
        eventId: 'advancedBonus',
      },
      completion: {
        type: Expr.Type.Or,
        argIds: ['greenCubeStackedOnYellow', 'yellowCubeStackedOnGreen'],
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
      exprId: 'greenCubeStackedOnYellow',
      name: tr('Green Cube Stacked on Yellow'),
    },

    {
      exprId: 'yellowCubeStackedOnGreen',
      name: tr('Yellow Cube Stacked on Green'),
    },
    { exprId: 'bonus', name: tr('Bonus: Second stack consisting of Green and Yellow Cube') },
    { exprId: 'advancedBonus', name: tr('Advanced Bonus: Two stacks such that Green Cube is stacked on Yellow and Yellow Cube is stacked on Green') }

  ],
  failureGoals: [

  ],
  sceneId: 'bex3'

} as Challenge;