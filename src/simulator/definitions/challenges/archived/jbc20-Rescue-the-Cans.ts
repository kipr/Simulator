import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 20'),
  description: tr(`Junior Botball Challenge 20: Rescue the Cans`),
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
    
    can2Upright: {
      name: tr('Can 2 Upright'),
      description: tr('Can 2 is upright'),
    },
    can9Upright: {
      name: tr('Can 9 Upright'),
      description: tr('Can 9 is upright'),
    },
    can10Upright: {
      name: tr('Can 10 Upright'),
      description: tr('Can 10 is upright'),
    },
    can12Upright: {
      name: tr('Can 12 Upright'),
      description: tr('Can 12 is upright'),
    },

    can9Intersects: {
      name: tr('Can 9 Intersects'),
      description: tr('Can 9 rescued intersecting paper ream'),
    },
    can2Intersects: {
      name: tr('Can 2 Intersects'),
      description: tr('Can 2 rescued intersecting paper ream'),
    },
    can10Intersects: {
      name: tr('Can 10 Intersects'),
      description: tr('Can 10 rescued intersecting paper ream'),
    },
    can12Intersects: {
      name: tr('Can 12 Intersects'),
      description: tr('Can 12 rescued intersecting paper ream'),
    },
  },
  success: {
    exprs: {
      // Rescued upright can events
      can9Upright: {
        type: Expr.Type.Event,
        eventId: 'can9Upright',
      },
      can9UprightOnce: {
        type: Expr.Type.Once,
        argId: 'can9Upright',
      },
      can2Upright: {
        type: Expr.Type.Event,
        eventId: 'can2Upright',
      },
      can2UprightOnce: {
        type: Expr.Type.Once,
        argId: 'can2Upright',
      },
      can10Upright: {
        type: Expr.Type.Event,
        eventId: 'can10Upright',
      },
      can10UprightOnce: {
        type: Expr.Type.Once,
        argId: 'can10Upright',
      },
      can12Upright: {
        type: Expr.Type.Event,
        eventId: 'can12Upright',
      },
      can12UprightOnce: {
        type: Expr.Type.Once,
        argId: 'can12Upright',
      },


      // Rescued intersecting can events
      can9Intersects: {
        type: Expr.Type.Event,
        eventId: 'can9Intersects',
      },
      can9IntersectsOnce: {
        type: Expr.Type.Once,
        argId: 'can9Intersects',
      },
      can2Intersects: {
        type: Expr.Type.Event,
        eventId: 'can2Intersects',
      },
      can2IntersectsOnce: {
        type: Expr.Type.Once,
        argId: 'can2Intersects',
      },
      can10Intersects: {
        type: Expr.Type.Event,
        eventId: 'can10Intersects',
      },
      can10IntersectsOnce: {
        type: Expr.Type.Once,
        argId: 'can10Intersects',
      },
      can12Intersects: {
        type: Expr.Type.Event,
        eventId: 'can12Intersects',
      },
      can12IntersectsOnce: {
        type: Expr.Type.Once,
        argId: 'can12Intersects',
      },
      

      // Intersecting and Upright
      IntersectingUpright9: {
        type: Expr.Type.And,
        argIds: ['can9Upright', 'can9Intersects'],
      },
      IntersectingUpright2: {
        type: Expr.Type.And,
        argIds: ['can2Upright', 'can2Intersects'],
      },
      IntersectingUpright10: {
        type: Expr.Type.And,
        argIds: ['can10Upright', 'can10Intersects'],
      },
      IntersectingUpright12: {
        type: Expr.Type.And,
        argIds: ['can12Upright', 'can12Intersects'],
      },


      completion: {
        type: Expr.Type.And,
        argIds: [
          'IntersectingUpright9',
          'IntersectingUpright2',
          'IntersectingUpright10',
          'IntersectingUpright12'
        ],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc20',
} as Challenge;
