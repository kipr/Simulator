import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import LocalizedString from "../../../util/LocalizedString";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: "JBC Challenge 4B" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 4B: Barrel Racing`,
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
    can5Intersects: {
      name: { [LocalizedString.EN_US]: "Can 5 Intersects" },
      description: { [LocalizedString.EN_US]: "Can 5 intersects circle 5" },
    },
    can8Intersects: {
      name: { [LocalizedString.EN_US]: "Can 8 Intersects" },
      description: { [LocalizedString.EN_US]: "Can 8 intersects circle 8" },
    },
    can9Intersects: {
      name: { [LocalizedString.EN_US]: "Can 9 Intersects" },
      description: { [LocalizedString.EN_US]: "Can 9 intersects circle 9" },
    },

    can5Upright: {
      name: { [LocalizedString.EN_US]: "Can 5 Upright" },
      description: { [LocalizedString.EN_US]: "Can 5 upright on circle 5" },
    },
    can8Upright: {
      name: { [LocalizedString.EN_US]: "Can 8 Upright" },
      description: { [LocalizedString.EN_US]: "Can 8 upright on circle 8" },
    },
    can9Upright: {
      name: { [LocalizedString.EN_US]: "Can 9 Upright" },
      description: { [LocalizedString.EN_US]: "Can 9 upright on circle 9" },
    },

    leaveStartBox: {
      name: { [LocalizedString.EN_US]: "Robot Left Start" },
      description: { [LocalizedString.EN_US]: "Robot left starting box" },
    },
    returnStartBox: {
      name: { [LocalizedString.EN_US]: "Robot Rentered Start" },
      description: { [LocalizedString.EN_US]: "Robot reentered starting box" },
    },

    clockwise8: {
      name: { [LocalizedString.EN_US]: "Can 8 Clockwise" },
      description: {
        [LocalizedString.EN_US]: "Robot drove clockwise around can 8",
      },
    },
    counterClockwise5: {
      name: { [LocalizedString.EN_US]: "Can 5 Counter Clockwise" },
      description: {
        [LocalizedString.EN_US]: "Robot drove counter clockwise around can 5",
      },
    },
    counterClockwise9: {
      name: { [LocalizedString.EN_US]: "Can 9 Counter Clockwise" },
      description: {
        [LocalizedString.EN_US]: "Robot drove counter clockwise around can 9",
      },
    },
  },
  success: {
    exprs: {
      // Clockwise Events
      clockwise8: {
        type: Expr.Type.Event,
        eventId: "clockwise8",
      },
      clockwise8Once: {
        type: Expr.Type.Once,
        argId: "clockwise8",
      },

      // Counter Clockwise Events
      counterClockwise5: {
        type: Expr.Type.Event,
        eventId: "counterClockwise5",
      },
      counterClockwise5Once: {
        type: Expr.Type.Once,
        argId: "counterClockwise5",
      },
      counterClockwise9: {
        type: Expr.Type.Event,
        eventId: "counterClockwise9",
      },
      counterClockwise9Once: {
        type: Expr.Type.Once,
        argId: "counterClockwise9",
      },

      clockMovements: {
        type: Expr.Type.And,
        argIds: ["clockwise8Once", "counterClockwise5Once","counterClockwise9Once"],
      },


      // Intersects Events
      can5Intersects: {
        type: Expr.Type.Event,
        eventId: "can5Intersects",
      },
      can8Intersects: {
        type: Expr.Type.Event,
        eventId: "can8Intersects",
      },
      can9Intersects: {
        type: Expr.Type.Event,
        eventId: "can9Intersects",
      },

      // Upright Events
      can5Upright: {
        type: Expr.Type.Event,
        eventId: "can5Upright",
      },
      can8Upright: {
        type: Expr.Type.Event,
        eventId: "can8Upright",
      },
      can9Upright: {
        type: Expr.Type.Event,
        eventId: "can9Upright",
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
      IntersectsUpright5: {
        type: Expr.Type.And,
        argIds: ["can5Intersects", "can5Upright"],
      },
      IntersectsUpright8: {
        type: Expr.Type.And,
        argIds: ["can8Intersects", "can8Upright"],
      },
      IntersectsUpright9: {
        type: Expr.Type.And,
        argIds: ["can9Intersects", "can9Upright"],
      },

      // Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: [
          "IntersectsUpright5",
          "IntersectsUpright8",
          "IntersectsUpright9",
          "startingBox",
          "clockMovements"
        ],
      },
    },
    rootId: "completion",
  },
  sceneId: "jbc4b",
} as Challenge;
