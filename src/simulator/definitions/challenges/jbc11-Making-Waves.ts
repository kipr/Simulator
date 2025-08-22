import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr("JBC Challenge 11"),
  description: tr(`Junior Botball Challenge 11: Making Waves`),
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
    wave: {
      name: tr("Robot Waved"),
      description: tr("Robot waved"),
    },
    circle3Touched: {
      name: tr("Circle 3 Touched"),
      description: tr("Circle 3 touched"),
    },
    circle6Touched: {
      name: tr("Circle 6 Touched"),
      description: tr("Circle 6 touched"),
    },
    circle9Touched: {
      name: tr("Circle 9 Touched"),
      description: tr("Circle 9 touched"),
    },
    circle12Touched: {
      name: tr("Circle 12 Touched"),
      description: tr("Circle 12 touched"),
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

      // Wave Events
      wave: {
        type: Expr.Type.Event,
        eventId: "wave",
      },

      // Circle Events
      circle3Touched: {
        type: Expr.Type.Event,
        eventId: "circle3Touched",
      },
      circle3Waved: {
        type: Expr.Type.And,
        argIds: [
          "circle3Touched",
          "wave",
        ],
      },
      circle3WavedOnce: {
        type: Expr.Type.Once,
        argId: "circle3Waved",
      },
      circle6Touched: {
        type: Expr.Type.Event,
        eventId: "circle6Touched",
      },
      circle6Waved: {
        type: Expr.Type.And,
        argIds: [
          "circle6Touched",
          "wave",
        ],
      },
      circle6WavedOnce: {
        type: Expr.Type.Once,
        argId: "circle6Waved",
      },
      circle9Touched: {
        type: Expr.Type.Event,
        eventId: "circle9Touched",
      },
      circle9Waved: {
        type: Expr.Type.And,
        argIds: [
          "circle9Touched",
          "wave",
        ],
      },
      circle9WavedOnce: {
        type: Expr.Type.Once,
        argId: "circle9Waved",
      },
      circle12Touched: {
        type: Expr.Type.Event,
        eventId: "circle12Touched",
      },
      circle12Waved: {
        type: Expr.Type.And,
        argIds: [
          "circle12Touched",
          "wave",
        ],
      },
      circle12WavedOnce: {
        type: Expr.Type.Once,
        argId: "circle12Waved",
      },

      // Success Logic = All circles waved at least once and began in start box
      completion: {
        type: Expr.Type.And,
        argIds: [
          "inStartBoxOnce",
          "circle3WavedOnce",
          "circle6WavedOnce",
          "circle9WavedOnce",
          "circle12WavedOnce",
        ],
      },
    },
    rootId: "completion",
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'circle3WavedOnce', name: tr('Wave at circle 3') },
    { exprId: 'circle6WavedOnce', name: tr('Wave at circle 6') },
    { exprId: 'circle9WavedOnce', name: tr('Wave at circle 9') },
    { exprId: 'circle12WavedOnce', name: tr('Wave at circle 12') },
  ],
  sceneId: "jbc11",
} as Challenge;
