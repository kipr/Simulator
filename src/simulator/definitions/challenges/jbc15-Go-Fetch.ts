import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr("JBC Challenge 15"),
  description: tr(`Junior Botball Challenge 15: Go Fetch`),
  author: {
    type: Author.Type.Organization,
    id: "kipr",
  },
  code: {
    'c': ProgrammingLanguage.DEFAULT_CODE.c,
    'cpp': ProgrammingLanguage.DEFAULT_CODE.cpp,
    'python': ProgrammingLanguage.DEFAULT_CODE.python,
  },
  defaultLanguage: "c",
  events: {
    notInStartBox: {
      name: tr("Robot not in Start Box"),
      description: tr("Robot not in start box"),
    },
    canInStartBox: {
      name: tr("Can in Start Box"),
      description: tr("Can in start box"),
    },
    can11Upright: {
      name: tr("Can 11 Upright"),
      description: tr("Can 11 upright"),
    },
  },
  success: {
    exprs: {
      // Start Box Events
      notInStartBox: {
        type: Expr.Type.Event,
        eventId: "notInStartBox",
      },
      inStartBox: {
        type: Expr.Type.Not,
        argId: "notInStartBox",
      },
      inStartBoxOnce: {
        type: Expr.Type.Once,
        argId: "inStartBox",
      },

      // Can Events
      canInStartBox: {
        type: Expr.Type.Event,
        eventId: "canInStartBox",
      },
      // Success Logic = Can 7 not upright, waited to chop, and began in start box
      completion: {
        type: Expr.Type.And,
        argIds: [
          "inStartBoxOnce",
          "canInStartBox",
        ],
      },
    },
    rootId: "completion",
  },
  failure: {
    exprs: {
      can11Upright: {
        type: Expr.Type.Event,
        eventId: "can11Upright",
      },
      can11NotUpright: {
        type: Expr.Type.Not,
        argId: "can11Upright",
      },

      // Success Logic = Can 7 not upright, waited to chop, and began in start box
      failure: {
        type: Expr.Type.And,
        argIds: [
          "can11NotUpright",
        ],
      },
    },
    rootId: "failure",
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'canInStartBox', name: tr('Bring can to Start Box') },
  ],
  failureGoals: [
    { exprId: 'can11NotUpright', name: tr('Can 11 not upright') },
  ],
  sceneId: "jbc15",
} as Challenge;
