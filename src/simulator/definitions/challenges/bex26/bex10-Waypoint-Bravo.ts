import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 10'),
  description: tr('Botball Explorer Mission 10: Waypoint Bravo'),
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

    noStop: {
      name: tr('Robot Did Not Stop'),
      description: tr('The Robot did not stop in the stop box')
    },
    bonus: {
      name: tr('Bonus'),
      description: tr('The Robot returned to the start box')
    },
    base: {
      name: tr('Base Mission'),
      description: tr('The Robot completed the Base Mission')
    },
    robotInEndBoxNotTouchingBlackLine: {
      name: tr('Robot in End Box Not Touching Black Line'),
      description: tr('The Robot is in the end box and not touching the black line')
    }


  },
  success: {
    exprs: {
      noStop: {
        type: Expr.Type.Event,
        eventId: 'noStop',
      },
      noStopNot: {
        type: Expr.Type.Not,
        argId: 'noStop',
      },
      bonus: {
        type: Expr.Type.Event,
        eventId: 'bonus',
      },
      base: {
        type: Expr.Type.Event,
        eventId: 'robotInEndBoxNotTouchingBlackLine',
      },
      completionOnce: {
        type: Expr.Type.Once,
        argId: 'base',
      },

      completion: {
        type: Expr.Type.And,
        argIds: ['completionOnce', 'noStopNot'],
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
      exprId: 'completion',
      name: tr('Robot Entered End Box and did not touch the black line'),
    },

    {
      exprId: 'bonus',
      name: tr('Bonus: Robot returned to the start box'),

    },

  ],
  failureGoals: [

  ],
  sceneId: 'bex10'

} as Challenge;