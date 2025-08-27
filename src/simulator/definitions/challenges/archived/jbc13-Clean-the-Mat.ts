import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 13'),
  description: tr(`Junior Botball Challenge 13: Clean the Mat`),
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
    can2Intersects: {
      name: tr('Can 2 Intersects'),
      description: tr('Can 2 intersects chosen garage'),
    },
    can5Intersects: {
      name: tr('Can 5 Intersects'),
      description: tr('Can 5 intersects chosen garage'),
    },
    can8Intersects: {
      name: tr('Can 8 Intersects'),
      description: tr('Can 8 intersects chosen garage'),
    },
    can10Intersects: {
      name: tr('Can 10 Intersects'),
      description: tr('Can 10 intersects chosen garage'),
    },
    can11Intersects: {
      name: tr('Can 11 Intersects'),
      description: tr('Can 11 intersects chosen garage'),
    },

    can2Upright: {
      name: tr('Can 2 Upright'),
      description: tr('Can 2 upright in chosen garage'),
    },
    can5Upright: {
      name: tr('Can 5 Upright'),
      description: tr('Can 5 upright in achosen garage'),
    },
    can8Upright: {
      name: tr('Can 8 Upright'),
      description: tr('Can 8 upright in chosen garage'),
    },
    can10Upright: {
      name: tr('Can 10 Upright'),
      description: tr('Can 10 upright in chosen garage'),
    },
    can11Upright: {
      name: tr('Can 11 Upright'),
      description: tr('Can 11 upright in chosen garage'),
    },


  },
  success: {
    exprs: {

      // Intersects Events
      can2Intersects: {
        type: Expr.Type.Event,
        eventId: 'can2Intersects',
      },
      can5Intersects: {
        type: Expr.Type.Event,
        eventId: 'can5Intersects',
      },
      can8Intersects: {
        type: Expr.Type.Event,
        eventId: 'can8Intersects',
      },
      can10Intersects: {
        type: Expr.Type.Event,
        eventId: 'can10Intersects',
      },
      can11Intersects: {
        type: Expr.Type.Event,
        eventId: 'can11Intersects',
      },
    
      cansIntersects: {
        type: Expr.Type.And,
        argIds: ['can2Intersects', 'can5Intersects', 'can8Intersects','can10Intersects', 'can11Intersects'],
      },

      // Upright Events
      can2Upright: {
        type: Expr.Type.Event,
        eventId: 'can2Upright',
      },
      can5Upright: {
        type: Expr.Type.Event,
        eventId: 'can5Upright',
      },
      can8Upright: {
        type: Expr.Type.Event,
        eventId: 'can8Upright',
      },
      can10Upright: {
        type: Expr.Type.Event,
        eventId: 'can10Upright',
      },
      can11Upright: {
        type: Expr.Type.Event,
        eventId: 'can11Upright',
      },
      
      cansUpright: {
        type: Expr.Type.And,
        argIds: ['can2Upright', 'can5Upright','can8Upright','can10Upright', 'can11Upright'],
      },


      // Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: [

          'cansIntersects',
          'cansUpright'
      
        ],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc13',
} as Challenge;
