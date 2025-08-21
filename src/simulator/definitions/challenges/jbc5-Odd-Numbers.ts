import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import LocalizedString from "../../../util/LocalizedString";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: "JBC Challenge 5" },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 5: Odd Numbers`,
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
    touchedEvenCircle: {
      name: { [LocalizedString.EN_US]: "Even Circle Touched" },
      description: { [LocalizedString.EN_US]: "Even circle touched" },
    },
    wrongOrder: {
      name: { [LocalizedString.EN_US]: "Circle Touched Out of Order" },
      description: { [LocalizedString.EN_US]: "Circle was touched out of order" },
    },
    circle1Touched: {
      name: { [LocalizedString.EN_US]: "Circle 1 Touched" },
      description: { [LocalizedString.EN_US]: "Circle 1 was touched" },
    },
    circle3Touched: {
      name: { [LocalizedString.EN_US]: "Circle 3 Touched" },
      description: { [LocalizedString.EN_US]: "Circle 3 was touched" },
    },
    circle5Touched: {
      name: { [LocalizedString.EN_US]: "Circle 5 Touched" },
      description: { [LocalizedString.EN_US]: "Circle 5 was touched" },
    },
    circle7Touched: {
      name: { [LocalizedString.EN_US]: "Circle 7 Touched" },
      description: { [LocalizedString.EN_US]: "Circle 7 was touched" },
    },
    circle9Touched: {
      name: { [LocalizedString.EN_US]: "Circle 9 Touched" },
      description: { [LocalizedString.EN_US]: "Circle 9 was touched" },
    },
    circle11Touched: {
      name: { [LocalizedString.EN_US]: "Circle 11 Touched" },
      description: { [LocalizedString.EN_US]: "Circle 11 was touched" },
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

      // Touch Events
      circle1Touched: {
        type: Expr.Type.Event,
        eventId: 'circle1Touched',
      },
      circle1TouchedOnce: {
        type: Expr.Type.Once,
        argId: 'circle1Touched'
      },
      circle3Touched: {
        type: Expr.Type.Event,
        eventId: 'circle3Touched',
      },
      circle3TouchedOnce: {
        type: Expr.Type.Once,
        argId: 'circle3Touched'
      },
      circle5Touched: {
        type: Expr.Type.Event,
        eventId: 'circle5Touched',
      },
      circle5TouchedOnce: {
        type: Expr.Type.Once,
        argId: 'circle5Touched'
      },
      circle7Touched: {
        type: Expr.Type.Event,
        eventId: 'circle7Touched',
      },
      circle7TouchedOnce: {
        type: Expr.Type.Once,
        argId: 'circle7Touched'
      },
      circle9Touched: {
        type: Expr.Type.Event,
        eventId: 'circle9Touched',
      },
      circle9TouchedOnce: {
        type: Expr.Type.Once,
        argId: 'circle9Touched'
      },
      circle11Touched: {
        type: Expr.Type.Event,
        eventId: 'circle11Touched',
      },
      circle11TouchedOnce: {
        type: Expr.Type.Once,
        argId: 'circle11Touched'
      },

      // Success = All Circles Touched
      completion: {
        type: Expr.Type.And,
        argIds: [
          'inStartBoxOnce',
          'circle1TouchedOnce',
          'circle3TouchedOnce',
          'circle5TouchedOnce',
          'circle7TouchedOnce',
          'circle9TouchedOnce',
          'circle11TouchedOnce',
        ],
      },
    },
    rootId: "completion",
  },
  failure: {
    exprs: {
      touchedEvenCircle: {
        type: Expr.Type.Event,
        eventId: 'touchedEvenCircle',
      },
      touchedEvenCircleOnce: {
        type: Expr.Type.Once,
        argId: 'touchedEvenCircle'
      },
      wrongOrder: {
        type: Expr.Type.Event,
        eventId: 'wrongOrder',
      },
      wrongOrderOnce: {
        type: Expr.Type.Once,
        argId: 'wrongOrder'
      },

      // Failure = Touched Even Circle or Touched Circle in Wrong Order
      failure: {
        type: Expr.Type.Or,
        argIds: [
          'touchedEvenCircleOnce',
          'wrongOrderOnce',
        ],
      },
    },
    rootId: "failure"
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: { [LocalizedString.EN_US]: 'Start in the Start Box' } },
    { exprId: 'circle1TouchedOnce', name: { [LocalizedString.EN_US]: 'Touch circle 1' } },
    { exprId: 'circle3TouchedOnce', name: { [LocalizedString.EN_US]: 'Touch circle 3' } },
    { exprId: 'circle5TouchedOnce', name: { [LocalizedString.EN_US]: 'Touch circle 5' } },
    { exprId: 'circle7TouchedOnce', name: { [LocalizedString.EN_US]: 'Touch circle 7' } },
    { exprId: 'circle9TouchedOnce', name: { [LocalizedString.EN_US]: 'Touch circle 9' } },
    { exprId: 'circle11TouchedOnce', name: { [LocalizedString.EN_US]: 'Touch circle 11' } },
  ],
  failureGoals: [
    {
      exprId: 'touchedEvenCircleOnce',
      name: { [LocalizedString.EN_US]: 'Touched an even circle' },
    },
    {
      exprId: 'wrongOrderOnce',
      name: { [LocalizedString.EN_US]: 'Circle touched out of order' },
    },
  ],
  sceneId: "jbc5",
} as Challenge;
