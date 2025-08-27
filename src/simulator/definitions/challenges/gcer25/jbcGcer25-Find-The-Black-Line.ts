import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from '../../../../programming/compiler/ProgrammingLanguage';

import tr from '@i18n';

export default {
  name: tr('GCER 2025: Find the Black Line'),
  description: tr('GCER 2025 special event. Your robot is randomly placed on one of the red circles. Find the black starting line and stop. Bonus points for returning to the original starting circle.'),
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
    stopAtBlackLine: {
      name: tr('Robot Stops at Black Line'),
      description: tr('Robot stops at black line'),
    },
    onCircle: {
      name: tr('Robot Over Circle'),
      description: tr('Robot over selected circle'),
    },
  },
  success: {
    exprs: {
      onCircle: {
        type: Expr.Type.Event,
        eventId: 'onCircle',
      },
      onCircleOnce: {
        type: Expr.Type.Once,
        argId: 'onCircle',
      },
      stopAtBlackLine: {
        type: Expr.Type.Event,
        eventId: 'stopAtBlackLine',
      },

      completion: {
        type: Expr.Type.And,
        argIds: [
          'onCircleOnce',
          'stopAtBlackLine',
        ],
      },
    },
    rootId: 'completion',
  },
  successGoals: [
    { exprId: 'onCircleOnce', name: tr('Robot started on Circle') },
    { exprId: 'stopAtBlackLine', name: tr('Robot Stops at Black Line') },
  ],
  sceneId: 'Find_The_Black_Line',
} as Challenge;
