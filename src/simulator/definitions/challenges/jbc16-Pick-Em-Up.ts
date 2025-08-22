import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 16'),
  description: tr(`Junior Botball Challenge 16: Pick 'Em Up`),
  author: {
    type: Author.Type.Organization,
    id: 'kipr',
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
    can2PickedUp: {
      name: tr('Can 2 Picked Up'),
      description: tr('Can 2 picked up'),
    },
    can9PickedUp: {
      name: tr('Can 9 Picked Up'),
      description: tr('Can 9 picked up'),
    },
    can10PickedUp: {
      name: tr('Can 10 Picked Up'),
      description: tr('Can 10 picked up'),
    },

    can2Upright: {
      name: tr('Can 2 Upright'),
      description: tr('Can 2 upright'),
    },
    can9Upright: {
      name: tr('Can 9 Upright'),
      description: tr('Can 9 upright'),
    },
    can10Upright: {
      name: tr('Can 10 Upright'),
      description: tr('Can 10 upright'),
    },

    can2Intersects: {
      name: tr('Can 2 Intersects Green Garage'),
      description: tr('Can 2 intersects Green Garage'),
    },
    can9Intersects: {
      name: tr('Can 9 Intersects Blue Garage'),
      description: tr('Can 9 intersects Blue Garage'),
    },
    can9IntersectsPurple: {
      name: tr('Can 9 Intersects Purple Garage'),
      description: tr('Can 9 intersects Purple Garage'),
    },
    can10Intersects: {
      name: tr('Can 10 Intersects Yellow Garage'),
      description: tr('Can 10 intersects Yellow Garage'),
    },

  },
  success: {
    exprs: {
      // Start Box Events
      notInStartBox: {
        type: Expr.Type.Event,
        eventId: 'notInStartBox',
      },
      inStartBox: {
        type: Expr.Type.Not,
        argId: 'notInStartBox',
      },
      inStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'inStartBox',
      },
      // Picked Up Events
      can2PickedUp: {
        type: Expr.Type.Event,
        eventId: 'can2PickedUp',
      },
      can2PickedUpOnce: {
        type: Expr.Type.Once,
        argId: 'can2PickedUp',
      },
      can2NotPickedUpOnce: {
        type: Expr.Type.Not,
        argId: 'can2PickedUpOnce',
      },
      can9PickedUp: {
        type: Expr.Type.Event,
        eventId: 'can9PickedUp',
      },
      can9PickedUpOnce: {
        type: Expr.Type.Once,
        argId: 'can9PickedUp',
      },
      can9NotPickedUpOnce: {
        type: Expr.Type.Not,
        argId: 'can9PickedUpOnce',
      },
      can10PickedUp: {
        type: Expr.Type.Event,
        eventId: 'can10PickedUp',
      },
      can10PickedUpOnce: {
        type: Expr.Type.Once,
        argId: 'can10PickedUp',
      },
      can10NotPickedUpOnce: {
        type: Expr.Type.Not,
        argId: 'can10PickedUpOnce',
      },

      // Upright Events
      can2Upright: {
        type: Expr.Type.Event,
        eventId: 'can2Upright',
      },
      can2NotUpright: {
        type: Expr.Type.Not,
        argId: 'can2Upright',
      },
      can9Upright: {
        type: Expr.Type.Event,
        eventId: 'can9Upright',
      },
      can9NotUpright: {
        type: Expr.Type.Not,
        argId: 'can9Upright',
      },
      can10Upright: {
        type: Expr.Type.Event,
        eventId: 'can10Upright',
      },
      can10NotUpright: {
        type: Expr.Type.Not,
        argId: 'can10Upright',
      },

      // Intersects Events
      can2Intersects: {
        type: Expr.Type.Event,
        eventId: 'can2Intersects',
      },
      can9Intersects: {
        type: Expr.Type.Event,
        eventId: 'can9Intersects',
      },
      can10Intersects: {
        type: Expr.Type.Event,
        eventId: 'can10Intersects',
      },

      // Upright and Intersects logic
      can2UprightPickedUpIntersects: {
        type: Expr.Type.And,
        argIds: ['can2Upright', 'can2PickedUpOnce', 'can2Intersects'],
      },
      can9UprightPickedUpIntersects: {
        type: Expr.Type.And,
        argIds: ['can9Upright', 'can9PickedUpOnce', 'can9Intersects'],
      },
      can10UprightPickedUpIntersects: {
        type: Expr.Type.And,
        argIds: ['can10Upright', 'can10PickedUpOnce', 'can10Intersects'],
      },

      // Final And Logic
      cansUprightAndIntersects: {
        type: Expr.Type.And,
        argIds: ['can2UprightPickedUpIntersects', 'can9UprightPickedUpIntersects', 'can10UprightPickedUpIntersects',],
      },



      // Success logic
      completion: {
        type: Expr.Type.And,
        argIds: ['inStartBoxOnce', 'cansUprightAndIntersects'],
      },
    },
    rootId: 'completion',
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'can2Intersects', name: tr('Place can 2 in green garage') },
    { exprId: 'can9Intersects', name: tr('Place can 9 in blue garage') },
    { exprId: 'can10Intersects', name: tr('Place can 10 in yellow garage') },
  ],
  failureGoals: [
    { exprId: 'can2NotUpright', name: tr('Can 2 not upright') },
    { exprId: 'can9NotUpright', name: tr('Can 9 not upright') },
    { exprId: 'can10NotUpright', name: tr('Can 10 not upright') },
    { exprId: 'can2NotPickedUpOnce', name: tr('Can 2 not picked up') },
    { exprId: 'can9NotPickedUpOnce', name: tr('Can 9 not picked up') },
    { exprId: 'can10NotPickedUpOnce', name: tr('Can 10 not picked up') },
  ],
  sceneId: 'jbc16',
} as Challenge;
