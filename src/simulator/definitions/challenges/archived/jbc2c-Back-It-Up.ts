import Author from "../../../../db/Author";
import Challenge from "../../../../state/State/Challenge";
import Expr from "../../../../state/State/Challenge/Expr";
import LocalizedString from "../../../../util/LocalizedString";
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: "JBC Challenge 2C" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 2C: Back It Up`,
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
    can6Intersects: {
      name: { [LocalizedString.EN_US]: "Can 6 Intersects" },
      description: { [LocalizedString.EN_US]: "Can 6 intersects circle 6" },
    },

    can6Upright: {
      name: { [LocalizedString.EN_US]: "Can 6 Upright" },
      description: { [LocalizedString.EN_US]: "Can 6 upright on circle 6" },
    },

    leaveStartBox: {
      name: { [LocalizedString.EN_US]: "Robot Left Start" },
      description: { [LocalizedString.EN_US]: "Robot left starting box" },
    },
    returnStartBox: {
      name: { [LocalizedString.EN_US]: "Robot Rentered Start" },
      description: { [LocalizedString.EN_US]: "Robot reentered starting box" },
    },

    driveBackwards: {
      name: { [LocalizedString.EN_US]: "Robot Driving Backwards" },
      description: { [LocalizedString.EN_US]: "Robot is driving backwards" },
    },

    rightSide: {
      name: { [LocalizedString.EN_US]: "Robot Passed Right Side" },
      description: {
        [LocalizedString.EN_US]: "Robot passed right side of can 6",
      },
    },

    topSide: {
      name: { [LocalizedString.EN_US]: "Robot Passed Top Side" },
      description: {
        [LocalizedString.EN_US]: "Robot passed top side of can 6",
      },
    },

    leftSide: {
      name: { [LocalizedString.EN_US]: "Robot Passed left Side" },
      description: {
        [LocalizedString.EN_US]: "Robot passed left side of can 6",
      },
    },
  },
  success: {
    exprs: {
      // Driving Backwards events
      driveBackwards: {
        type: Expr.Type.Event,
        eventId: "driveBackwards",
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
      can6Intersects: {
        type: Expr.Type.Event,
        eventId: "can6Intersects",
      },

      // Upright Events
      can6Upright: {
        type: Expr.Type.Event,
        eventId: "can6Upright",
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
        argIds: ["can6Intersects", "can6Upright"],
      },

      // Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: [
          "driveBackwards",
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
  sceneId: "jbc2c",
} as Challenge;
