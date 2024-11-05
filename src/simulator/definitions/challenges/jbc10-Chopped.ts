import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import LocalizedString from "../../../util/LocalizedString";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: "JBC Challenge 10" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 10: Chopped`,
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
    waitedToChop: {
      name: { [LocalizedString.EN_US]: "Waited to Chop" },
      description: { [LocalizedString.EN_US]: "Robot waited to chop" },
    },
    can7Upright: {
      name: { [LocalizedString.EN_US]: "Can 7 Upright" },
      description: { [LocalizedString.EN_US]: "Can 7 upright" },
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
  sceneId: "jbc10",
} as Challenge;
