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
    can7Chopped: {
      name: tr("Can 7 Chopped"),
      description: tr("Can 7 chopped"),
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
      can7Chopped: {
        type: Expr.Type.Event,
        eventId: "can7Chopped",
      },
      // Success Logic = Can 7 chopped, waited to chop, and began in start box
      completion: {
        type: Expr.Type.And,
        argIds: [
          "inStartBoxOnce",
          "waitedToChop",
          "can7Chopped",
        ],
      },
    },
    rootId: "completion",
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'waitedToChop', name: tr('Wait before chopping') },
    { exprId: 'can7Chopped', name: tr('Can 7 chopped') },
  ],
  sceneId: "jbc10",
} as Challenge;
