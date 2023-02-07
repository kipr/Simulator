import Author from "../db/Author";
import Challenge from "../state/State/Challenge";
import Expr from "../state/State/Challenge/Expr";
import LocalizedString from "../util/LocalizedString";

export default {
  name: { [LocalizedString.EN_US]: "JBC Challenge 7" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 7: Bulldozer Mania`,
  },
  author: {
    type: Author.Type.Organization,
    id: "kipr",
    //COMME
  },
  code: {
    c: `#include <kipr/botball.h>`,
    cpp: `#include <kipr/botball.h>`,
    python: `from kipr import botball`,
  },
  defaultLanguage: "c",
  events: {
    canAIntersects: {
      name: { [LocalizedString.EN_US]: "Can A Intersects" },
      description: { [LocalizedString.EN_US]: "Can A behind start line" },
    },
    canBIntersects: {
      name: { [LocalizedString.EN_US]: "Can B Intersects" },
      description: { [LocalizedString.EN_US]: "Can B behind start line" },
    },
    canCIntersects: {
      name: { [LocalizedString.EN_US]: "Can C Intersects" },
      description: { [LocalizedString.EN_US]: "Can C behind start line" },
    },

    canAUpright: {
      name: { [LocalizedString.EN_US]: "Can A Upright" },
      description: {
        [LocalizedString.EN_US]: "Can A upright behind start line",
      },
    },
    canBUpright: {
      name: { [LocalizedString.EN_US]: "Can B Upright" },
      description: {
        [LocalizedString.EN_US]: "Can B upright behind start line",
      },
    },
    canCUpright: {
      name: { [LocalizedString.EN_US]: "Can C Upright" },
      description: {
        [LocalizedString.EN_US]: "Can C upright behind start line",
      },
    },

    leaveStartBox: {
      name: { [LocalizedString.EN_US]: "Robot Left Start" },
      description: { [LocalizedString.EN_US]: "Robot left starting box" },
    },
    returnStartBox: {
      name: { [LocalizedString.EN_US]: "Robot Rentered Start" },
      description: { [LocalizedString.EN_US]: "Robot reentered starting box" },
    },
  },
  success: {
    exprs: {
      // Intersects Events
      canAIntersects: {
        type: Expr.Type.Event,
        eventId: "canAIntersects",
      },
      canBIntersects: {
        type: Expr.Type.Event,
        eventId: "canBIntersects",
      },
      canCIntersects: {
        type: Expr.Type.Event,
        eventId: "canCIntersects",
      },

      //Upright Events
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

      //Start Box Events
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

      //Intersects and upright logic
      IntersectsUprightA: {
        type: Expr.Type.And,
        argIds: ["canAIntersects", "canAUpright"],
      },
      IntersectsUprightB: {
        type: Expr.Type.And,
        argIds: ["canBIntersects", "canBUpright"],
      },
      IntersectsUprightC: {
        type: Expr.Type.And,
        argIds: ["canCIntersects", "canCUpright"],
      },
      AllIntersectsUpright: {
        type: Expr.Type.And,
        argIds: [
          "IntersectsUprightA",
          "IntersectsUprightB",
          "IntersectsUprightC",
        ],
      },

      //Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: ["startingBox", "AllIntersectsUpright"],
      },
    },
    rootId: "completion",
  },
  sceneId: "jbc7",
} as Challenge;
