import Author from "../db/Author";
import Challenge from "../state/State/Challenge";
import Expr from "../state/State/Challenge/Expr";
import LocalizedString from "../util/LocalizedString";

export default {
  name: { [LocalizedString.EN_US]: "JBC Challenge 4" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 4: Figure Eight`,
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

    leaveStartBox: {
      name: { [LocalizedString.EN_US]: "Robot Left Start" },
      description: { [LocalizedString.EN_US]: "Robot left starting box" },
    },
    returnStartBox: {
      name: { [LocalizedString.EN_US]: "Robot Rentered Start" },
      description: { [LocalizedString.EN_US]: "Robot reentered starting box" },
    },

    rightSide4: {
      name: { [LocalizedString.EN_US]: "Robot Passed Right Side" },
      description: {
        [LocalizedString.EN_US]: "Robot passed right side of can 4",
      },
    },

    rightSide9: {
      name: { [LocalizedString.EN_US]: "Robot Passed Right Side" },
      description: {
        [LocalizedString.EN_US]: "Robot passed right side of can 9",
      },
    },

    middleCheck: {
      name: { [LocalizedString.EN_US]: "Robot Passed Middle" },
      description: {
        [LocalizedString.EN_US]: "Robot passed between cans 4 and 9",
      },
    },

    topSide: {
      name: { [LocalizedString.EN_US]: "Robot Passed Top Side" },
      description: {
        [LocalizedString.EN_US]: "Robot passed top side of can 9",
      },
    },

    leftSide4: {
      name: { [LocalizedString.EN_US]: "Robot Passed Left" },
      description: {
        [LocalizedString.EN_US]: "Robot passed left side of can 4",
      },
    },
    leftSide9: {
      name: { [LocalizedString.EN_US]: "Robot Passed Left" },
      description: {
        [LocalizedString.EN_US]: "Robot passed left side of can 9",
      },
    },
  },
  success: {
    exprs: {
      //Passing side events
      rightSide4: {
        type: Expr.Type.Event,
        eventId: "rightSide4",
      },
      rightSide4Once: {
        type: Expr.Type.Once,
        argId: "rightSide4",
      },
      rightSide9: {
        type: Expr.Type.Event,
        eventId: "rightSide9",
      },
      rightSide9Once: {
        type: Expr.Type.Once,
        argId: "rightSide9",
      },
      leftSide4: {
        type: Expr.Type.Event,
        eventId: "leftSide4",
      },
      leftSide4Once: {
        type: Expr.Type.Once,
        argId: "leftSide4",
      },
      leftSide9: {
        type: Expr.Type.Event,
        eventId: "leftSide9",
      },
      leftSide9Once: {
        type: Expr.Type.Once,
        argId: "leftSide9",
      },
      middleCheck: {
        type: Expr.Type.Event,
        eventId: "middleCheck",
      },
      middleCheckOnce: {
        type: Expr.Type.Once,
        argId: "middleCheck",
      },
      topSide: {
        type: Expr.Type.Event,
        eventId: "topSide",
      },
      topSideOnce: {
        type: Expr.Type.Once,
        argId: "topSide",
      },




      left4ThenMiddle: {
        type: Expr.Type.And,
        argIds: ["leftSide4Once", "middleCheckOnce"],
      },

      left4MiddleRight9: {
        type: Expr.Type.And,
        argIds: ["left4ThenMiddle", "rightSide9Once"],
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

      //Upright Events
      can4Upright: {
        type: Expr.Type.Event,
        eventId: "can4Upright",
      },
      can9Upright: {
        type: Expr.Type.Event,
        eventId: "can9Upright",
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
      IntersectsUpright4: {
        type: Expr.Type.And,
        argIds: ["can4Intersects", "can4Upright"],
      },
      IntersectsUpright9: {
        type: Expr.Type.And,
        argIds: ["can9Intersects", "can9Upright"],
      },

      //Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: [
          "IntersectsUpright4",
          "IntersectsUpright9",
          "startingBox",
          "left4ThenMiddle"
          
        ],
      },
    },
    rootId: "completion",
  },
  sceneId: "jbc4",
} as Challenge;
