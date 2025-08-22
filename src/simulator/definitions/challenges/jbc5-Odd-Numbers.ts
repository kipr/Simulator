import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr("JBC Challenge 5"),
  description: tr(`Junior Botball Challenge 5: Odd Numbers`),
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
    touchedEvenCircle: {
      name: tr("Even Circle Touched"),
      description: tr("Even circle touched"),
    },
    wrongOrder: {
      name: tr("Circle Touched Out of Order"),
      description: tr("Circle was touched out of order"),
    },
    circle1Touched: {
      name: tr("Circle 1 Touched"),
      description: tr("Circle 1 was touched"),
    },
    circle3Touched: {
      name: tr("Circle 3 Touched"),
      description: tr("Circle 3 was touched"),
    },
    circle5Touched: {
      name: tr("Circle 5 Touched"),
      description: tr("Circle 5 was touched"),
    },
    circle7Touched: {
      name: tr("Circle 7 Touched"),
      description: tr("Circle 7 was touched"),
    },
    circle9Touched: {
      name: tr("Circle 9 Touched"),
      description: tr("Circle 9 was touched"),
    },
    circle11Touched: {
      name: tr("Circle 11 Touched"),
      description: tr("Circle 11 was touched"),
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
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'circle1TouchedOnce', name: tr('Touch circle 1') },
    { exprId: 'circle3TouchedOnce', name: tr('Touch circle 3') },
    { exprId: 'circle5TouchedOnce', name: tr('Touch circle 5') },
    { exprId: 'circle7TouchedOnce', name: tr('Touch circle 7') },
    { exprId: 'circle9TouchedOnce', name: tr('Touch circle 9') },
    { exprId: 'circle11TouchedOnce', name: tr('Touch circle 11') },
  ],
  failureGoals: [
    {
      exprId: 'touchedEvenCircleOnce',
      name: tr('Touched an even circle'),
    },
    {
      exprId: 'wrongOrderOnce',
      name: tr('Circle touched out of order'),
    },
  ],
  sceneId: "jbc5",
} as Challenge;
