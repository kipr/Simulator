import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import LocalizedString from "../../../util/LocalizedString";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: "JBC Challenge 15" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 15: Go Fetch`,
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
    canInStartBox: {
      name: { [LocalizedString.EN_US]: "Can in Start Box" },
      description: { [LocalizedString.EN_US]: "Can in start box" },
    },
    can11Upright: {
      name: { [LocalizedString.EN_US]: "Can 11 Upright" },
      description: { [LocalizedString.EN_US]: "Can 11 upright" },
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

      //Can Events
      canInStartBox: {
        type: Expr.Type.Event,
        eventId: "canInStartBox",
      },
      can7Upright: {
        type: Expr.Type.Event,
        eventId: "can7Upright",
      },

      // Success Logic = Can 7 not upright, waited to chop, and began in start box
      completion: {
        type: Expr.Type.And,
        argIds: [
          "inStartBoxOnce",
          "canInStartBox",
          "can11Upright",
        ],
      },
    },
    rootId: "completion",
  },
  sceneId: "jbc15",
} as Challenge;
