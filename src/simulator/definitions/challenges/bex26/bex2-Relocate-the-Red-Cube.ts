import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 2'),
  description: tr('Botball Explorer Mission 2: Relocate the Red Cube'),
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
    palletTouchBlackLine: {
      name: tr('Pallet Touch Black Line'),
      description: tr('Pallet touched the black line'),
    },
    largeRedCubeNotTouchBlackLine: {
      name: tr('Large Red Cube Not Touch Black Line'),
      description: tr('Large Red Cube did not touch the black line'),
    },
    lowRedCubeNotTouchBlackLine: {
      name: tr('Low Red Cube Not Touch Black Line'),
      description: tr('Low Red Cube did not touch the black line'),
    },
    highRedCubeNotTouchBlackLine: {
      name: tr('High Red Cube Not Touch Black Line'),
      description: tr('High Red Cube did not touch the black line'),
    },

  },
  success: {
    exprs: {

      palletNotTouchBlackLine: {
        type: Expr.Type.Event,
        eventId: 'palletNotTouchBlackLine',
      },


      largeRedCubeNotTouchBlackLine: {
        type: Expr.Type.Event,
        eventId: 'largeRedCubeNotTouchBlackLine',
      },

      lowRedCubeNotTouchBlackLine: {
        type: Expr.Type.Event,
        eventId: 'lowRedCubeNotTouchBlackLine',
      },

      lowRedCubeNotTouchBlackLineOnce: {
        type: Expr.Type.Once,
        argId: 'lowRedCubeNotTouchBlackLine',
      },
      highRedCubeNotTouchBlackLine: {
        type: Expr.Type.Event,
        eventId: 'highRedCubeNotTouchBlackLine',
      },

      highRedCubeNotTouchBlackLineOnce: {
        type: Expr.Type.Once,
        argId: 'highRedCubeNotTouchBlackLine',
      },
      completion: {
        type: Expr.Type.And,
        argIds: ['palletNotTouchBlackLine', 'largeRedCubeNotTouchBlackLine'],
      },
    },
    rootId: 'completion',
  },
  failure: {
    exprs: {

      palletNotTouchBlackLine: {
        type: Expr.Type.Event,
        eventId: 'palletNotTouchBlackLine',
      },
      palletTouchBlackLine: {
        type: Expr.Type.Not,
        argId: 'palletNotTouchBlackLine',
      },

      largeRedCubeNotTouchBlackLine: {
        type: Expr.Type.Event,
        eventId: 'largeRedCubeNotTouchBlackLine',
      },

      largeRedCubeTouchBlackLine: {
        type: Expr.Type.Not,
        argId: 'largeRedCubeNotTouchBlackLine',
      },



      failure: {
        type: Expr.Type.And,
        argIds: ['palletTouchBlackLine', 'largeRedCubeTouchBlackLine'],
      }
    },
    rootId: 'failure',
  },
  successGoals: [

    {
      exprId: 'palletNotTouchBlackLine',
      name: tr('Pallet Not Touching the Black Line'),
    },
    {
      exprId: 'largeRedCubeNotTouchBlackLine',
      name: tr('Large Red Cube Not Touching the Black Line'),
    },
    {
      exprId: 'lowRedCubeNotTouchBlackLine',
      name: tr('Bonus: Low Red Cube Not Touching the Black Line'),
    },
    {
      exprId: 'highRedCubeNotTouchBlackLine',
      name: tr('Bonus: High Red Cube Not Touching the Black Line'),
    }

  ],
  failureGoals: [
    {
      exprId: 'palletTouchBlackLine',
      name: tr('Pallet Touching the Black Line'),
    },
    {
      exprId: 'largeRedCubeTouchBlackLine',
      name: tr('Large Red Cube Touching the Black Line'),
    }

  ],
  sceneId: 'bex2'

} as Challenge;