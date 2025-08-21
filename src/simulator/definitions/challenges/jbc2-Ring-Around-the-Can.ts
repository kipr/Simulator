import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import LocalizedString from "../../../util/LocalizedString";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: "JBC Challenge 2" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 2: Ring Around the Can`,
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
    notInStartBox: {
      name: { [LocalizedString.EN_US]: "Robot not in Start Box" },
      description: { [LocalizedString.EN_US]: "Robot not in start box" },
    },
    can6Intersects: {
      name: { [LocalizedString.EN_US]: "Can 6 Intersects" },
      description: { [LocalizedString.EN_US]: "Can 6 intersects circle 6" },
    },
    can6Upright: {
      name: { [LocalizedString.EN_US]: "Can 6 Upright" },
      description: { [LocalizedString.EN_US]: "Can 6 upright on circle 6" },
    },
    returnStartBox: {
      name: { [LocalizedString.EN_US]: "Robot Rentered Start" },
      description: { [LocalizedString.EN_US]: "Robot reentered starting box" },
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
      name: { [LocalizedString.EN_US]: 'Start in the Start Box' },
    },
    {
      exprId: 'rightSideOnce',
      name: { [LocalizedString.EN_US]: 'Pass the right side of can 6' },
    },
    {
      exprId: 'topSideOnce',
      name: { [LocalizedString.EN_US]: 'Pass the top side of can 6' },
    },
    {
      exprId: 'leftSideOnce',
      name: { [LocalizedString.EN_US]: 'Pass the left side of can 6' },
    },
    {
      exprId: 'returnStartBox',
      name: { [LocalizedString.EN_US]: 'Return to the Start Box' },
    },
  ],
  failureGoals: [
    {
      exprId: 'can6NotIntersects',
      name: { [LocalizedString.EN_US]: 'Can 6 not in circle 6' },
    },
    {
      exprId: 'can6NotUpright',
      name: { [LocalizedString.EN_US]: 'Can 6 not upright' },
    },
  ],
  sceneId: "jbc2",
} as Challenge;
