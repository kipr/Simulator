import Author from "../../../../db/Author";
import Challenge from "../../../../state/State/Challenge";
import Expr from "../../../../state/State/Challenge/Expr";
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr("JBC Challenge 2C"),
  description: tr(`Junior Botball Challenge 2C: Back It Up`),
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
      name: tr("Can 6 Intersects"),
      description: tr("Can 6 intersects circle 6"),
    },

    can6Upright: {
      name: tr("Can 6 Upright"),
      description: tr("Can 6 upright on circle 6"),
    },

    leaveStartBox: {
      name: tr("Robot Left Start"),
      description: tr("Robot left starting box"),
    },
    returnStartBox: {
      name: tr("Robot Rentered Start"),
      description: tr("Robot reentered starting box"),
    },

    driveBackwards: {
      name: tr("Robot Driving Backwards"),
      description: tr("Robot is driving backwards"),
    },

    rightSide: {
      name: tr("Robot Passed Right Side"),
      description: tr("Robot passed right side of can 6"),
    },

    topSide: {
      name: tr("Robot Passed Top Side"),
      description: tr("Robot passed top side of can 6"),
    },

    leftSide: {
      name: tr("Robot Passed left Side"),
      description: tr("Robot passed left side of can 6"),
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
