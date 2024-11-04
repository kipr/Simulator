import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import LocalizedString from "../../../util/LocalizedString";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: "JBC Challenge 6" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 6: Figure Eight`,
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
    can4Intersects: {
      name: { [LocalizedString.EN_US]: "Can 4 Intersects" },
      description: { [LocalizedString.EN_US]: "Can 4 intersects circle 4" },
    },
    can9Intersects: {
      name: { [LocalizedString.EN_US]: "Can 9 Intersects" },
      description: { [LocalizedString.EN_US]: "Can 9 intersects circle 9" },
    },

    can4Upright: {
      name: { [LocalizedString.EN_US]: "Can 4 Upright" },
      description: { [LocalizedString.EN_US]: "Can 4 upright on circle 4" },
    },
    can9Upright: {
      name: { [LocalizedString.EN_US]: "Can 9 Upright" },
      description: { [LocalizedString.EN_US]: "Can 9 upright on circle 9" },
    },

    notInStartBox: {
      name: { [LocalizedString.EN_US]: "Robot not in Start Box" },
      description: { [LocalizedString.EN_US]: "Robot not in start box" },
    },
    returnStartBox: {
      name: { [LocalizedString.EN_US]: "Robot Rentered Start" },
      description: { [LocalizedString.EN_US]: "Robot reentered starting box" },
    },

    figureEight: {
      name: { [LocalizedString.EN_US]: "Robot Figure Eight" },
      description: {
        [LocalizedString.EN_US]: "Robot did a figure eight around cans 4 and 9",
      },
    },
  },
  success: {
    exprs: {
      // Figure Eight Event
      figureEight: {
        type: Expr.Type.Event,
        eventId: "figureEight",
      },
      figureEightOnce: {
        type: Expr.Type.Once,
        argId: "figureEight",
      },

      // Intersects Events
      can4Intersects: {
        type: Expr.Type.Event,
        eventId: "can4Intersects",
      },
      can9Intersects: {
        type: Expr.Type.Event,
        eventId: "can9Intersects",
      },

      // Upright Events
      can4Upright: {
        type: Expr.Type.Event,
        eventId: "can4Upright",
      },
      can9Upright: {
        type: Expr.Type.Event,
        eventId: "can9Upright",
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
      returnStartBox: {
        type: Expr.Type.Event,
        eventId: "returnStartBox",
      },
      returnStartBoxOnce: {
        type: Expr.Type.Once,
        argId: "returnStartBox",
      },

      // Intersects and upright logic
      intersectsUpright4: {
        type: Expr.Type.And,
        argIds: ["can4Intersects", "can4Upright"],
      },
      intersectsUpright9: {
        type: Expr.Type.And,
        argIds: ["can9Intersects", "can9Upright"],
      },

      // Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: ["intersectsUpright4", "intersectsUpright9", "figureEightOnce", "returnStartBoxOnce", "inStartBoxOnce"],
      },
    },
    rootId: "completion",
  },
  sceneId: "jbc6",
} as Challenge;
