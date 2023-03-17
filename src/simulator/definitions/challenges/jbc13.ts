import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 13' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 13: Clean the Mat`,
  },
  author: {
    type: Author.Type.Organization,
    id: 'kipr',
    //COMME
  },
  code: {
    c: `#include <kipr/botball.h>`,
    cpp: `#include <kipr/botball.h>`,
    python: `from kipr import botball`,
  },
  defaultLanguage: 'c',
  events: {
    can2Intersects: {
      name: { [LocalizedString.EN_US]: 'Can 2 Intersects' },
      description: { [LocalizedString.EN_US]: 'Can 2 intersects chosen garage' },
    },
    can5Intersects: {
      name: { [LocalizedString.EN_US]: 'Can 5 Intersects' },
      description: { [LocalizedString.EN_US]: 'Can 5 intersects chosen garage' },
    },
    can8Intersects: {
      name: { [LocalizedString.EN_US]: 'Can 8 Intersects' },
      description: { [LocalizedString.EN_US]: 'Can 8 intersects chosen garage' },
    },
    can10Intersects: {
      name: { [LocalizedString.EN_US]: 'Can 10 Intersects' },
      description: { [LocalizedString.EN_US]: 'Can 10 intersects chosen garage' },
    },
    can11Intersects: {
      name: { [LocalizedString.EN_US]: 'Can 11 Intersects' },
      description: { [LocalizedString.EN_US]: 'Can 11 intersects chosen garage' },
    },

    can2Upright: {
      name: { [LocalizedString.EN_US]: 'Can 2 Upright' },
      description: { [LocalizedString.EN_US]: 'Can 2 upright in chosen garage' },
    },
    can5Upright: {
      name: { [LocalizedString.EN_US]: 'Can 5 Upright' },
      description: { [LocalizedString.EN_US]: 'Can 5 upright in achosen garage' },
    },
    can8Upright: {
      name: { [LocalizedString.EN_US]: 'Can 8 Upright' },
      description: { [LocalizedString.EN_US]: 'Can 8 upright in chosen garage' },
    },
    can10Upright: {
      name: { [LocalizedString.EN_US]: 'Can 10 Upright' },
      description: { [LocalizedString.EN_US]: 'Can 10 upright in chosen garage' },
    },
    can11Upright: {
      name: { [LocalizedString.EN_US]: 'Can 11 Upright' },
      description: { [LocalizedString.EN_US]: 'Can 11 upright in chosen garage' },
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

      //Upright Events
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


      //Success Logic = Can A upright, intersects and touched
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
