import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from '../../../../programming/compiler/ProgrammingLanguage';
import tr from '@i18n';

export default {
  name: tr('GCER 2025: Mountain Rescue'),
  description: tr('GCER 2025 special event. Now with three more cans to rescue!'),
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
    can4Upright: {
      name: tr('Can 4 Upright'),
      description: tr('Can 4 is upright'),
    },
    can5Upright: {
      name: tr('Can 5 Upright'),
      description: tr('Can 5 is upright'),
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
    can4Intersects: {
      name: tr('Can 4 Intersects'),
      description: tr('Can 4 rescued intersecting starting box'),
    },
    can5Intersects: {
      name: tr('Can 5 Intersects'),
      description: tr('Can 5 rescued intersecting starting box'),
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

      // Rescued upright can events
      can1Upright: {
        type: Expr.Type.Event,
        eventId: 'can1Upright',
      },
      can2Upright: {
        type: Expr.Type.Event,
        eventId: 'can2Upright',
      },
      can3Upright: {
        type: Expr.Type.Event,
        eventId: 'can3Upright',
      },
      can4Upright: {
        type: Expr.Type.Event,
        eventId: 'can4Upright',
      },
      can5Upright: {
        type: Expr.Type.Event,
        eventId: 'can5Upright',
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
      can4Intersects: {
        type: Expr.Type.Event,
        eventId: 'can4Intersects',
      },
      can5Intersects: {
        type: Expr.Type.Event,
        eventId: 'can5Intersects',
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
      intersectingUpright4: {
        type: Expr.Type.And,
        argIds: ['can4Upright', 'can4Intersects'],
      },
      intersectingUpright4Once: {
        type: Expr.Type.Once,
        argId: 'intersectingUpright4',
      },
      intersectingUpright5: {
        type: Expr.Type.And,
        argIds: ['can5Upright', 'can5Intersects'],
      },
      intersectingUpright5Once: {
        type: Expr.Type.Once,
        argId: 'intersectingUpright5',
      },

      completion: {
        type: Expr.Type.And,
        argIds: ['inStartBoxOnce', 'intersectingUpright1Once', 'intersectingUpright2Once', 'intersectingUpright3Once', 'intersectingUpright4Once', 'intersectingUpright4Once'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'Mountain_Rescue',
} as Challenge;
