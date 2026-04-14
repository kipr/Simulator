import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 18'),
  description: tr(`Junior Botball Challenge 18: Stackerz`),
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
    leaveStartBox: {
      name: tr('Robot Left Start'),
      description: tr('Robot left starting box'),
    },
    canStacked: {
      name: tr('One Can Stacked'),
      description: tr('One can is stacked on another'),
    },
    robotTouchCan: {
      name: tr('Robot Touching Can'),
      description: tr('Robot is touching a can'),
    },
  },
  success: {
    exprs: {
      // Startbox Events
      leaveStartBox: {
        type: Expr.Type.Event,
        eventId: 'leaveStartBox',
      },
      leaveStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'leaveStartBox',
      },

      // Can Events
      canStacked: {
        type: Expr.Type.Event,
        eventId: 'canStacked',
      },

      completion: {
        type: Expr.Type.And,
        argIds: ['leaveStartBoxOnce', 'canStacked'],
      },
    },
    rootId: 'completion',
  },
  failure: {
    exprs: {
      robotTouchCan: {
        type: Expr.Type.Event,
        eventId: 'robotTouchCan',
      },
      failure: {
        type: Expr.Type.Or,
        argIds: ['robotTouchCan'],
      },
    },
    rootId: 'failure',
  },
  successGoals: [
    { exprId: 'leaveStartBoxOnce', name: tr('Leave the Start Box') },
    { exprId: 'canStacked', name: tr('Stack one can on another') },
  ],
  failureGoals: [
    { exprId: 'robotTouchCan', name: tr('Robot touching can') },
  ],
  sceneId: 'jbc18',
} as Challenge;
