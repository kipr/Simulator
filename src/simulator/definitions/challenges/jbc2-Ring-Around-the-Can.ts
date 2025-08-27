import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr("JBC Challenge 2"),
  description: tr(`Junior Botball Challenge 2: Ring Around the Can`),
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
    can6Intersects: {
      name: tr("Can 6 Intersects"),
      description: tr("Can 6 intersects circle 6"),
    },
    can6Upright: {
      name: tr("Can 6 Upright"),
      description: tr("Can 6 upright on circle 6"),
    },
    returnStartBox: {
      name: tr("Robot Rentered Start"),
      description: tr("Robot reentered starting box"),
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

      returnStartBox: {
        type: Expr.Type.Event,
        eventId: "returnStartBox",
      },

      completion: {
        type: Expr.Type.And,
        argIds: [
          "inStartBoxOnce",
          "returnStartBox",
          "rightSideOnce",
          "topSideOnce",
          "leftSideOnce"
        ],
      },
    },
    rootId: "completion",
  },
  failure: {
    exprs: {
      // Intersects Events
      can6Intersects: {
        type: Expr.Type.Event,
        eventId: 'can6Intersects',
      },
      can6NotIntersects: {
        type: Expr.Type.Not,
        argId: 'can6Intersects',
      },

      // Upright Events
      can6Upright: {
        type: Expr.Type.Event,
        eventId: 'can6Upright',
      },
      can6NotUpright: {
        type: Expr.Type.Not,
        argId: 'can6Upright',
      },

      failure: {
        type: Expr.Type.Or,
        argIds: ['can6NotIntersects', 'can6NotUpright'],
      },
    },
    rootId: 'failure',
  },
  successGoals: [
    {
      exprId: 'inStartBoxOnce',
      name: tr('Start in the Start Box'),
    },
    {
      exprId: 'rightSideOnce',
      name: tr('Pass the right side of can 6'),
    },
    {
      exprId: 'topSideOnce',
      name: tr('Pass the top side of can 6'),
    },
    {
      exprId: 'leftSideOnce',
      name: tr('Pass the left side of can 6'),
    },
    {
      exprId: 'returnStartBox',
      name: tr('Return to the Start Box'),
    },
  ],
  failureGoals: [
    {
      exprId: 'can6NotIntersects',
      name: tr('Can 6 not in circle 6'),
    },
    {
      exprId: 'can6NotUpright',
      name: tr('Can 6 not upright'),
    },
  ],
  sceneId: "jbc2",
} as Challenge;
