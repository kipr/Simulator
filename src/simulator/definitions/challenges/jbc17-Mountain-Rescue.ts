import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 17'),
  description: tr(`Junior Botball Challenge 17: Mountain Rescue`),
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
    can1Upright: {
      name: tr('Can 1 Upright'),
      description: tr('Can 1 is upright'),
    },
    can2Upright: {
      name: tr('Can 2 Upright'),
      description: tr('Can 2 is upright'),
    },
    can3Upright: {
      name: tr('Can 3 Upright'),
      description: tr('Can 3 is upright'),
    },
    can1Intersects: {
      name: tr('Can 1 Intersects'),
      description: tr('Can 1 rescued intersecting starting box'),
    },
    can2Intersects: {
      name: tr('Can 2 Intersects'),
      description: tr('Can 2 rescued intersecting starting box'),
    },
    can3Intersects: {
      name: tr('Can 3 Intersects'),
      description: tr('Can 3 rescued intersecting starting box'),
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

      // Rescued upright can events
      can1Upright: {
        type: Expr.Type.Event,
        eventId: 'can1Upright',
      },
      can1NotUpright: {
        type: Expr.Type.Not,
        argId: 'can1Upright',
      },
      can2Upright: {
        type: Expr.Type.Event,
        eventId: 'can2Upright',
      },
      can2NotUpright: {
        type: Expr.Type.Not,
        argId: 'can2Upright',
      },
      can3Upright: {
        type: Expr.Type.Event,
        eventId: 'can3Upright',
      },
      can3NotUpright: {
        type: Expr.Type.Not,
        argId: 'can3Upright',
      },

      // Rescued intersecting can events
      can1Intersects: {
        type: Expr.Type.Event,
        eventId: 'can1Intersects',
      },
      can2Intersects: {
        type: Expr.Type.Event,
        eventId: 'can2Intersects',
      },
      can3Intersects: {
        type: Expr.Type.Event,
        eventId: 'can3Intersects',
      },

      // Intersecting and Upright
      intersectingUpright1: {
        type: Expr.Type.And,
        argIds: ['can1Upright', 'can1Intersects'],
      },
      intersectingUpright1Once: {
        type: Expr.Type.Once,
        argId: 'intersectingUpright1',
      },
      intersectingUpright2: {
        type: Expr.Type.And,
        argIds: ['can2Upright', 'can2Intersects'],
      },
      intersectingUpright2Once: {
        type: Expr.Type.Once,
        argId: 'intersectingUpright2',
      },
      intersectingUpright3: {
        type: Expr.Type.And,
        argIds: ['can3Upright', 'can3Intersects'],
      },
      intersectingUpright3Once: {
        type: Expr.Type.Once,
        argId: 'intersectingUpright3',
      },

      completion: {
        type: Expr.Type.And,
        argIds: ['inStartBoxOnce', 'intersectingUpright1Once', 'intersectingUpright2Once', 'intersectingUpright3Once'],
      },
    },
    rootId: 'completion',
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'can1Intersects', name: tr('Rescue can 1 to start box') },
    { exprId: 'can2Intersects', name: tr('Rescue can 2 to start box') },
    { exprId: 'can3Intersects', name: tr('Rescue can 3 to start box') },
  ],
  failureGoals: [
    { exprId: 'can1NotUpright', name: tr('Can 1 not upright') },
    { exprId: 'can2NotUpright', name: tr('Can 2 not upright') },
    { exprId: 'can3NotUpright', name: tr('Can 3 not upright') },
  ],
  sceneId: 'jbc17',
} as Challenge;
