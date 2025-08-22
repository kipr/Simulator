import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr("JBC Challenge 8"),
  description: tr(`Junior Botball Challenge 8: Bulldozer Mania`),
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
    canAUpright: {
      name: tr("Can A Upright"),
      description: tr("Can A upright behind start line"),
    },
    canBUpright: {
      name: tr("Can B Upright"),
      description: tr("Can B upright behind start line"),
    },
    canCUpright: {
      name: tr("Can C Upright"),
      description: tr("Can C upright behind start line"),
    },
    canDUpright: {
      name: tr("Can D Upright"),
      description: tr("Can D upright behind start line"),
    },
    canEUpright: {
      name: tr("Can E Upright"),
      description: tr("Can E upright behind start line"),
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
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'canAUpright', name: tr('First can upright in start box') },
    { exprId: 'canBUpright', name: tr('Second can upright in start box') },
    { exprId: 'canCUpright', name: tr('Third can upright in start box') },
    { exprId: 'canDUpright', name: tr('Fourth can upright in start box') },
    { exprId: 'canEUpright', name: tr('Fifth can upright in start box') },
  ],
  sceneId: "jbc8",
} as Challenge;
