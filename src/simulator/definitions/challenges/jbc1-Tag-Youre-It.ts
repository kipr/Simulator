import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 1'),
  description: tr(`Junior Botball Challenge 1: Tag, You're it!`),
  author: {
    type: Author.Type.Organization,
    id: 'kipr'
  },
  code: {
    'c': ProgrammingLanguage.DEFAULT_CODE.c,
    'cpp': ProgrammingLanguage.DEFAULT_CODE.cpp,
    'python': ProgrammingLanguage.DEFAULT_CODE.python,
  },
  defaultLanguage: 'c',
  events: {
    notInStartBox: {
      name: tr('Robot not in Start Box'),
      description: tr('Robot not in start box'),
    },
    can9Touched: {
      name: tr('Can 9 Touched'),
      description: tr('Can A touched'),
    },
    can9Intersects: {
      name: tr('Can 9 Intersects'),
      description: tr('Can 9 intersects circle 9'),
    },
    can9Upright: {
      name: tr('Can 9 Upright'),
      description: tr('Can 9 upright on circle 9'),
    },
    returnStartBox: {
      name: tr('Robot Rentered Start'),
      description: tr('Robot reentered starting box'),
    },
  },
  success: {
    exprs: {
      // Touch Events
      can9Touched: {
        type: Expr.Type.Event,
        eventId: 'can9Touched',
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
        eventId: 'returnStartBox',
      },
      returnStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'returnStartBox',
      },

      // Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: ['can9Touched', 'inStartBoxOnce', 'returnStartBoxOnce'],
      },
    },
    rootId: 'completion',
  },
  failure: {
    exprs: {
      // Intersects Events
      can9Intersects: {
        type: Expr.Type.Event,
        eventId: 'can9Intersects',
      },
      can9NotIntersects: {
        type: Expr.Type.Not,
        argId: 'can9Intersects',
      },

      // Upright Events
      can9Upright: {
        type: Expr.Type.Event,
        eventId: 'can9Upright',
      },
      can9NotUpright: {
        type: Expr.Type.Not,
        argId: 'can9Upright',
      },

      failure: {
        type: Expr.Type.Or,
        argIds: ['can9NotIntersects', 'can9NotUpright'],
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
      exprId: 'can9Touched',
      name: tr('Touch Can 9'),
    },
    {
      exprId: 'returnStartBoxOnce',
      name: tr('Return to the Start Box'),
    },
  ],
  failureGoals: [
    {
      exprId: 'can9NotIntersects',
      name: tr('Can 9 not in circle 9'),
    },
    {
      exprId: 'can9NotUpright',
      name: tr('Can 9 not upright'),
    },
  ],
  sceneId: 'jbc1',
} as Challenge;