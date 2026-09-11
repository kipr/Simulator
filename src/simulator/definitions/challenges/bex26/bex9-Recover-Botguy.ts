import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 9'),
  description: tr('Botball Explorer Mission 9: Recover Botguy'),
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
    robotTouchBotguy: {
      name: tr('Robot Touch Botguy'),
      description: tr('The Robot touched Botguy')
    },
    bonus: {
      name: tr('Bonus'),
      description: tr('Botguy is completely outside the enclosure AND is touching the warehouse floor')
    }

  },
  success: {
    exprs: {
      robotTouchBotguy: {
        type: Expr.Type.Event,
        eventId: 'robotTouchBotguy',
      },
      robotTouchBotguyOnce: {
        type: Expr.Type.Once,
        argId: 'robotTouchBotguy',
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
        argIds: ['robotTouchBotguyOnce'],
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
      exprId: 'robotTouchBotguyOnce',
      name: tr('Robot Touch Botguy'),
    },
    {
      exprId: 'bonusOnce',
      name: tr('Bonus: Botguy is completely outside the enclosure AND is touching the warehouse floor'),
    }
  ],
  failureGoals: [

  ],
  sceneId: 'bex9'

} as Challenge;