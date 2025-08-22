import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr("JBC Challenge 6"),
  description: tr(`Junior Botball Challenge 6: Figure Eight`),
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
      name: tr("Can 4 Intersects"),
      description: tr("Can 4 intersects circle 4"),
    },
    can9Intersects: {
      name: tr("Can 9 Intersects"),
      description: tr("Can 9 intersects circle 9"),
    },

    can4Upright: {
      name: tr("Can 4 Upright"),
      description: tr("Can 4 upright on circle 4"),
    },
    can9Upright: {
      name: tr("Can 9 Upright"),
      description: tr("Can 9 upright on circle 9"),
    },

    notInStartBox: {
      name: tr("Robot not in Start Box"),
      description: tr("Robot not in start box"),
    },
    returnStartBox: {
      name: tr("Robot Rentered Start"),
      description: tr("Robot reentered starting box"),
    },

    figureEight: {
      name: tr("Robot Figure Eight"),
      description: tr("Robot did a figure eight around cans 4 and 9"),
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
      can4NotIntersects: {
        type: Expr.Type.Not,
        argId: "can4Intersects",
      },
      can9Intersects: {
        type: Expr.Type.Event,
        eventId: "can9Intersects",
      },
      can9NotIntersects: {
        type: Expr.Type.Not,
        argId: "can9Intersects",
      },

      // Upright Events
      can4Upright: {
        type: Expr.Type.Event,
        eventId: "can4Upright",
      },
      can4NotUpright: {
        type: Expr.Type.Not,
        argId: "can4Upright",
      },
      can9Upright: {
        type: Expr.Type.Event,
        eventId: "can9Upright",
      },
      can9NotUpright: {
        type: Expr.Type.Not,
        argId: "can9Upright",
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
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'figureEightOnce', name: tr('Complete a figure eight') },
    { exprId: 'returnStartBoxOnce', name: tr('Return to the Start Box') },
  ],
  failureGoals: [
    { exprId: 'can4NotUpright', name: tr('Can 4 not upright in circle 4') },
    { exprId: 'can9NotUpright', name: tr('Can 9 not upright in circle 9') },
    { exprId: 'can4NotIntersects', name: tr('Can 4 does not intersect circle 4') },
    { exprId: 'can9NotIntersects', name: tr('Can 9 does not intersect circle 9') },
  ],
  sceneId: "jbc6",
} as Challenge;
