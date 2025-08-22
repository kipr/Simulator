import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr("JBC Challenge 10"),
  description: tr(`Junior Botball Challenge 10: Chopped`),
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
    waitedToChop: {
      name: tr("Waited to Chop"),
      description: tr("Robot waited to chop"),
    },
    can7Upright: {
      name: tr("Can 7 Upright"),
      description: tr("Can 7 upright"),
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

      // Chop Events
      waitedToChop: {
        type: Expr.Type.Event,
        eventId: "waitedToChop",
      },
      can7Upright: {
        type: Expr.Type.Event,
        eventId: "can7Upright",
      },
      can7NotUpright: {
        type: Expr.Type.Not,
        argId: "can7Upright",
      },

      // Success Logic = Can 7 not upright, waited to chop, and began in start box
      completion: {
        type: Expr.Type.And,
        argIds: [
          "inStartBoxOnce",
          "waitedToChop",
          "can7NotUpright",
        ],
      },
    },
    rootId: "completion",
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'waitedToChop', name: tr('Wait before chopping') },
    { exprId: 'can7NotUpright', name: tr('Knock over can 7') },
  ],
  sceneId: "jbc10",
} as Challenge;
