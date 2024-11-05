import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import LocalizedString from "../../../util/LocalizedString";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: "JBC Challenge 11" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 11: Making Waves`,
  },
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
      name: { [LocalizedString.EN_US]: "Robot not in Start Box" },
      description: { [LocalizedString.EN_US]: "Robot not in start box" },
    },
    wave: {
      name: { [LocalizedString.EN_US]: "Robot Waved" },
      description: { [LocalizedString.EN_US]: "Robot waved" },
    },
    circle3Touched: {
      name: { [LocalizedString.EN_US]: "Circle 3 Touched" },
      description: { [LocalizedString.EN_US]: "Circle 3 touched" },
    },
    circle6Touched: {
      name: { [LocalizedString.EN_US]: "Circle 6 Touched" },
      description: { [LocalizedString.EN_US]: "Circle 6 touched" },
    },
    circle9Touched: {
      name: { [LocalizedString.EN_US]: "Circle 9 Touched" },
      description: { [LocalizedString.EN_US]: "Circle 9 touched" },
    },
    circle12Touched: {
      name: { [LocalizedString.EN_US]: "Circle 12 Touched" },
      description: { [LocalizedString.EN_US]: "Circle 12 touched" },
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

      //Wave Events
      wave: {
        type: Expr.Type.Event,
        eventId: "wave",
      },

      //Circle Events
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
  sceneId: "jbc11",
} as Challenge;
