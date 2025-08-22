import Author from "../../../../db/Author";
import Challenge from "../../../../state/State/Challenge";
import Expr from "../../../../state/State/Challenge/Expr";
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr("JBC Challenge 2B"),
  description: tr(`Junior Botball Challenge 2B: Ring Around the Cans, Sr.`),
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
      name: tr("Can 10 Touched"),
      description: tr("Can 10 touched"),
    },
    can11Touched: {
      name: tr("Can 11 Touched"),
      description: tr("Can 11 touched"),
    },
    can12Touched: {
      name: tr("Can 12 Touched"),
      description: tr("Can 12 touched"),
    },

    can10Intersects: {
      name: tr("Can 10 Intersects"),
      description: tr("Can 10 intersects circle 10"),
    },
    can11Intersects: {
      name: tr("Can 11 Intersects"),
      description: tr("Can 11 intersects circle 11"),
    },
    can12Intersects: {
      name: tr("Can 12 Intersects"),
      description: tr("Can 12 intersects circle 12"),
    },

    can10Upright: {
      name: tr("Can 10 Upright"),
      description: tr("Can 10 upright on circle 10"),
    },
    can11Upright: {
      name: tr("Can 11 Upright"),
      description: tr("Can 11 upright on circle 11"),
    },
    can12Upright: {
      name: tr("Can 12 Upright"),
      description: tr("Can 12 upright on circle 12"),
    },

    leaveStartBox: {
      name: tr("Robot Left Start"),
      description: tr("Robot left starting box"),
    },
    returnStartBox: {
      name: tr("Robot Rentered Start"),
      description: tr("Robot reentered starting box"),
    },

    rightSide: {
      name: tr("Robot Passed Right Side"),
      description: tr("Robot passed right side of can 12"),
    },

    topSide: {
      name: tr("Robot Passed Top Side"),
      description: tr("Robot passed top side of can 11"),
    },

    leftSide: {
      name: tr("Robot Passed left Side"),
      description: tr("Robot passed left side of can 10"),
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
