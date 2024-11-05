import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 18' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 18: Stackerz`,
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


    leaveStartBox: {
      name: { [LocalizedString.EN_US]: 'Robot Left Start' },
      description: { [LocalizedString.EN_US]: 'Robot left starting box' },
    },

    canStacked: {
      name: { [LocalizedString.EN_US]: 'One Can Stacked' },
      description: { [LocalizedString.EN_US]: 'One can is stacked on another' },
    },

    robotTouchCan: {
      name: { [LocalizedString.EN_US]: 'Robot Touching Can' },
      description: { [LocalizedString.EN_US]: 'Robot is touching a can' },
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
      robotTouchCan: {
        type: Expr.Type.Event,
        eventId: 'robotTouchCan',
      },
      robotTouchCanNot: {
        type: Expr.Type.Not,
        argId: 'robotTouchCan',
      },


      completion: {
        type: Expr.Type.And,
        argIds: ['leaveStartBoxOnce', 'canStacked', 'robotTouchCanNot'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc18',
} as Challenge;
