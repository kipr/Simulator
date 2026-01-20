import Author from '../../../db/Author';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';
import LimitedChallenge from '../../../state/State/LimitedChallenge';

export default {
  name: tr('JBC Challenge 0'),
  description: tr(`Junior Botball Challenge 0: Drive Straight`),
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
    inStartBox: {
      name: tr('In Start Box'),
      description: tr('Robot is in the start box'),
    },
    notInStartBox: {
      name: tr('Not In Start Box'),
      description: tr('Robot is not in the start box'),
    },
    robotTouchingLine: {
      name: tr('Robot Touching Line B'),
      description: tr('Robot is touching line B'),
    },
    reachedEnd: {
      name: tr('Robot Reached End'),
      description: tr('Robot reached the end of the mat'),
    },
    offMat: {
      name: tr('Robot Off Mat'),
      description: tr('Robot left the mat'),
    },
  },
  success: {
    exprs: {

      // End of Mat Events
      reachedEnd: {
        type: Expr.Type.Event,
        eventId: 'reachedEnd',
      },

      // Start Box Events
      inStartBox: {
        type: Expr.Type.Event,
        eventId: 'inStartBox',
      },
      notInStartBox: {
        type: Expr.Type.Event,
        eventId: 'notInStartBox',
      },
      notOutOfStartBox: {
        type: Expr.Type.Not,
        argId: 'notInStartBox',
      },
      startedInStartBox: {
        type: Expr.Type.And,
        argIds: ['inStartBox', 'notOutOfStartBox'],
      },
      startedInStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'startedInStartBox',
      },
      completion: {
        type: Expr.Type.And,
        argIds: ['startedInStartBoxOnce', 'reachedEnd'],
      },
    },
    rootId: 'completion',
  },
  failure: {
    exprs: {
      // Line B Event
      robotTouchingLine: {
        type: Expr.Type.Event,
        eventId: 'robotTouchingLine',
      },

      robotTouchingLineOnce: {
        type: Expr.Type.Once,
        argId: 'robotTouchingLine',
      },
      // Off Mat Event
      offMat: {
        type: Expr.Type.Event,
        eventId: 'offMat',
      },

      offMatOnce: {
        type: Expr.Type.Once,
        argId: 'offMat',
      },

      failure: {
        type: Expr.Type.Or,
        argIds: ['robotTouchingLineOnce', 'offMatOnce'],
      },
    },
    rootId: 'failure',
  },
  successGoals: [
    {
      exprId: 'startedInStartBoxOnce',
      name: tr('Start in the Start Box'),
    },
    {
      exprId: 'reachedEnd',
      name: tr('Reach the end of the mat'),
    },
  ],
  failureGoals: [
    {
      exprId: 'robotTouchingLineOnce',
      name: tr('Wheels do not touch line B'),
    },
    {
      exprId: 'offMatOnce',
      name: tr('Do not drive off the mat'),
    },
  ],
  sceneId: 'jbc0',
  openDate: '2026-01-19T00:00:00Z',
  closeDate: '2026-01-22T23:59:59Z',
} as LimitedChallenge;
