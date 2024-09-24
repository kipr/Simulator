import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import LocalizedString from "../../../util/LocalizedString";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: "JBC Challenge 2B" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 2B: Ring Around the Cans, Sr.`,
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
    can10Touched: {
      name: { [LocalizedString.EN_US]: "Can 10 Touched" },
      description: { [LocalizedString.EN_US]: "Can 10 touched" },
    },
    can11Touched: {
      name: { [LocalizedString.EN_US]: "Can 11 Touched" },
      description: { [LocalizedString.EN_US]: "Can 11 touched" },
    },
    can12Touched: {
      name: { [LocalizedString.EN_US]: "Can 12 Touched" },
      description: { [LocalizedString.EN_US]: "Can 12 touched" },
    },

    can10Intersects: {
      name: { [LocalizedString.EN_US]: "Can 10 Intersects" },
      description: { [LocalizedString.EN_US]: "Can 10 intersects circle 10" },
    },
    can11Intersects: {
      name: { [LocalizedString.EN_US]: "Can 11 Intersects" },
      description: { [LocalizedString.EN_US]: "Can 11 intersects circle 11" },
    },
    can12Intersects: {
      name: { [LocalizedString.EN_US]: "Can 12 Intersects" },
      description: { [LocalizedString.EN_US]: "Can 12 intersects circle 12" },
    },

    can10Upright: {
      name: { [LocalizedString.EN_US]: "Can 10 Upright" },
      description: { [LocalizedString.EN_US]: "Can 10 upright on circle 10" },
    },
    can11Upright: {
      name: { [LocalizedString.EN_US]: "Can 11 Upright" },
      description: { [LocalizedString.EN_US]: "Can 11 upright on circle 11" },
    },
    can12Upright: {
      name: { [LocalizedString.EN_US]: "Can 12 Upright" },
      description: { [LocalizedString.EN_US]: "Can 12 upright on circle 12" },
    },

    leaveStartBox: {
      name: { [LocalizedString.EN_US]: "Robot Left Start" },
      description: { [LocalizedString.EN_US]: "Robot left starting box" },
    },
    returnStartBox: {
      name: { [LocalizedString.EN_US]: "Robot Rentered Start" },
      description: { [LocalizedString.EN_US]: "Robot reentered starting box" },
    },

    rightSide: {
      name: { [LocalizedString.EN_US]: "Robot Passed Right Side" },
      description: {
        [LocalizedString.EN_US]: "Robot passed right side of can 12",
      },
    },

    topSide: {
      name: { [LocalizedString.EN_US]: "Robot Passed Top Side" },
      description: {
        [LocalizedString.EN_US]: "Robot passed top side of can 11",
      },
    },

    leftSide: {
      name: { [LocalizedString.EN_US]: "Robot Passed left Side" },
      description: {
        [LocalizedString.EN_US]: "Robot passed left side of can 10",
      },
    },
  },
  success: {
    exprs: {
      // Touch Events
      can10Touched: {
        type: Expr.Type.Event,
        eventId: "can10Touched",
      },
      can10NotTouched: {
        type: Expr.Type.Not,
        argId: "can10Touched",
      },
      can11Touched: {
        type: Expr.Type.Event,
        eventId: "can11Touched",
      },
      can11NotTouched: {
        type: Expr.Type.Not,
        argId: "can11Touched",
      },
      can12Touched: {
        type: Expr.Type.Event,
        eventId: "can12Touched",
      },
      can12NotTouched: {
        type: Expr.Type.Not,
        argId: "can12Touched",
      },
      cansNotTouched: {
        type: Expr.Type.And,
        argIds: ["can10NotTouched", "can11NotTouched", "can12NotTouched"],
      },

      // Passing side events
      rightSide: {
        type: Expr.Type.Event,
        eventId: "rightSide",
      },
      rightSideOnce: {
        type: Expr.Type.Once,
        argId: "rightSide",
      },
      topSide: {
        type: Expr.Type.Event,
        eventId: "topSide",
      },
      topSideOnce: {
        type: Expr.Type.Once,
        argId: "topSide",
      },
      leftSide: {
        type: Expr.Type.Event,
        eventId: "leftSide",
      },
      leftSideOnce: {
        type: Expr.Type.Once,
        argId: "leftSide",
      },

      // Intersects Events
      can10Intersects: {
        type: Expr.Type.Event,
        eventId: "can10Intersects",
      },
      can11Intersects: {
        type: Expr.Type.Event,
        eventId: "can11Intersects",
      },
      can12Intersects: {
        type: Expr.Type.Event,
        eventId: "can12Intersects",
      },
      cansIntersects: {
        type: Expr.Type.And,
        argIds: ["can10Intersects", "can11Intersects", "can12Intersects"],
      },

      // Upright Events
      can10Upright: {
        type: Expr.Type.Event,
        eventId: "can10Upright",
      },
      can11Upright: {
        type: Expr.Type.Event,
        eventId: "can11Upright",
      },
      can12Upright: {
        type: Expr.Type.Event,
        eventId: "can12Upright",
      },
      cansUpright: {
        type: Expr.Type.And,
        argIds: ["can10Upright", "can11Upright", "can12Upright"],
      },

      // Start Box Events
      leaveStartBox: {
        type: Expr.Type.Event,
        eventId: "leaveStartBox",
      },
      leaveStartBoxOnce: {
        type: Expr.Type.Once,
        argId: "leaveStartBox",
      },
      returnStartBox: {
        type: Expr.Type.Event,
        eventId: "returnStartBox",
      },
      returnStartBoxOnce: {
        type: Expr.Type.Once,
        argId: "returnStartBox",
      },
      startingBox: {
        type: Expr.Type.And,
        argIds: ["leaveStartBoxOnce", "returnStartBoxOnce"],
      },

      // Intersects and upright logic
      IntersectsUpright: {
        type: Expr.Type.And,
        argIds: ["cansIntersects", "cansUpright"],
      },

      // Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: [
          "cansNotTouched",
          "IntersectsUpright",
          "startingBox",
          "rightSideOnce",
          "topSideOnce",
          "leftSideOnce",
        ],
      },
    },
    rootId: "completion",
  },
  sceneId: "jbc2b",
} as Challenge;
