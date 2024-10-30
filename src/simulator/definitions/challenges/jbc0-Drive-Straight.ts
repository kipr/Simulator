import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 0' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 0: Drive Straight`,
  },
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
      name: { [LocalizedString.EN_US]: 'In Start Box' },
      description: { [LocalizedString.EN_US]: 'Robot is in the start box' },
    },
    notInStartBox: {
      name: { [LocalizedString.EN_US]: 'Not In Start Box' },
      description: { [LocalizedString.EN_US]: 'Robot is not in the start box' },
    },
    robotTouchingLine: {
      name: { [LocalizedString.EN_US]: 'Robot Touching Line B' },
      description: { [LocalizedString.EN_US]: 'Robot is touching line B' },
    },
    reachedEnd: {
      name: { [LocalizedString.EN_US]: 'Robot Reached End' },
      description: { [LocalizedString.EN_US]: 'Robot reached the end of the mat' },
    },
    offMat: {
      name: { [LocalizedString.EN_US]: 'Robot Off Mat' },
      description: { [LocalizedString.EN_US]: 'Robot left the mat' },
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

      // Off Mat Event
      offMat: {
        type: Expr.Type.Event,
        eventId: 'offMat',
      },

      failure: {
        type: Expr.Type.Or,
        argIds: ['robotTouchingLine', 'offMat'],
      },
    },
    rootId: 'failure',
  },
  sceneId: 'jbc0',
} as Challenge;
