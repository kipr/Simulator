import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import LocalizedString from "../../../util/LocalizedString";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: "JBC Challenge 8" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 8: Bulldozer Mania`,
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
    canAUpright: {
      name: { [LocalizedString.EN_US]: "Can A Upright" },
      description: { [LocalizedString.EN_US]: "Can A upright behind start line" },
    },
    canBUpright: {
      name: { [LocalizedString.EN_US]: "Can B Upright" },
      description: { [LocalizedString.EN_US]: "Can B upright behind start line" },
    },
    canCUpright: {
      name: { [LocalizedString.EN_US]: "Can C Upright" },
      description: { [LocalizedString.EN_US]: "Can C upright behind start line" },
    },
    canDUpright: {
      name: { [LocalizedString.EN_US]: "Can D Upright" },
      description: { [LocalizedString.EN_US]: "Can D upright behind start line" },
    },
    canEUpright: {
      name: { [LocalizedString.EN_US]: "Can E Upright" },
      description: { [LocalizedString.EN_US]: "Can E upright behind start line" },
    },
  },
  success: {
    exprs: {
      // Upright Events
      canAUpright: {
        type: Expr.Type.Event,
        eventId: "canAUpright",
      },
      canBUpright: {
        type: Expr.Type.Event,
        eventId: "canBUpright",
      },
      canCUpright: {
        type: Expr.Type.Event,
        eventId: "canCUpright",
      },
      canDUpright: {
        type: Expr.Type.Event,
        eventId: "canDUpright",
      },
      canEUpright: {
        type: Expr.Type.Event,
        eventId: "canEUpright",
      },
      allUpright: {
        type: Expr.Type.And,
        argIds: ["canAUpright", "canBUpright", "canCUpright", "canDUpright", "canEUpright"],
      },

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

      // Success Logic
      completion: {
        type: Expr.Type.And,
        argIds: ["inStartBoxOnce", "allUpright"],
      },
    },
    rootId: "completion",
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: { [LocalizedString.EN_US]: 'Start in the Start Box' } },
    { exprId: 'canAUpright', name: { [LocalizedString.EN_US]: 'First can upright in start box' } },
    { exprId: 'canBUpright', name: { [LocalizedString.EN_US]: 'Second can upright in start box' } },
    { exprId: 'canCUpright', name: { [LocalizedString.EN_US]: 'Third can upright in start box' } },
    { exprId: 'canDUpright', name: { [LocalizedString.EN_US]: 'Fourth can upright in start box' } },
    { exprId: 'canEUpright', name: { [LocalizedString.EN_US]: 'Fifth can upright in start box' } },
  ],
  sceneId: "jbc8",
} as Challenge;
