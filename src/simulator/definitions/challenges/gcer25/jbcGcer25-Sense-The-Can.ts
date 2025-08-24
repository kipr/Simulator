import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from '../../../../programming/compiler/ProgrammingLanguage';
import tr from '@i18n';

export default {
  name: tr('GCER 2025: Sense the Can'),
  description: tr('GCER 2025 special event. A can is placed randomly in circle 2, 4, 6, 9 or 11. Find it and bring it back to the start box!'),
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
    notInStartBox: {
      name: tr('Robot not in Start Box'),
      description: tr('Robot not in start box'),
    },
    canInStartBox: {
      name: tr('Can in Start Box'),
      description: tr('Can in start box'),
    },
    canRandomUpright: {
      name: tr('Can Random Upright'),
      description: tr('Can Random upright'),
    },
  },
  success: {
    exprs: {
      // Start Box Events
      notInStartBox: {
        type: Expr.Type.Event,
        eventId: 'notInStartBox',
      },
      inStartBox: {
        type: Expr.Type.Not,
        argId: 'notInStartBox',
      },
      inStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'inStartBox',
      },

      // Can Events
      canInStartBox: {
        type: Expr.Type.Event,
        eventId: 'canInStartBox',
      },
      canRandomUpright: {
        type: Expr.Type.Event,
        eventId: 'canRandomUpright',
      },
      canNotUpright: {
        type: Expr.Type.Not,
        argId: 'canRandomUpright',
      },

      // Success Logic = Can upright, in start box, and robot began in start box
      completion: {
        type: Expr.Type.And,
        argIds: [
          'inStartBoxOnce',
          'canInStartBox',
          'canRandomUpright',
        ],
      },
    },
    rootId: 'completion',
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'canInStartBox', name: tr('Can in Start Box') },
  ],
  failureGoals: [
    { exprId: 'canNotUpright', name: tr('Can Not Upright') },
  ],
  sceneId: 'Sense_The_Can',
} as Challenge;
