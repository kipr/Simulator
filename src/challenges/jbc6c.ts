import Author from '../db/Author';
import Challenge from '../state/State/Challenge';
import Expr from '../state/State/Challenge/Expr';

import tr from '@i18n';

export default {
  name: tr('JBC Challenge 6C'),
  description: tr('Junior Botball Challenge 6C: Empty the Garage'),
  author: {
    type: Author.Type.Organization,
    id: 'kipr'
  },
  code: {
    'c': `#include <kipr/botball.h>`,
    'cpp': `#include <kipr/botball.h>`,
    'python': `from kipr import botball`,
  },
  defaultLanguage: 'c',
  events: {
    canALifted: {
      name: tr('Can A Lifted'),
      description: tr('Can A picked up')
    },
    canBLifted: {
      name: tr('Can B Lifted'),
      description: tr('Can B picked up'),
    },
    canCLifted: {
      name: tr('Can C Lifted'),
      description: tr('Can C picked up'),
    },
    canAPlaced: {
      name: tr('Can A Placed'),
      description: tr('Can A placed on circle 2'),
    },
    canBPlaced: {
      name: tr('Can B Placed'),
      description: tr('Can A placed on circle 9'),
    },
    canCPlaced: {
      name: tr('Can C Placed'),
      description: tr('Can A placed on circle 10'),
    },
    canAUpright: {
      name: tr('Can A Upright'),
      description: tr('Can A upright on circle 2'),
    },
    canBUpright: {
      name: tr('Can B Upright'),
      description: tr('Can B upright on circle 9'),
    },
    canCUpright: {
      name: tr('Can C Upright'),
      description: tr('Can C upright on circle 10'),
    },
  },
  success: {
    exprs: {
      // Lift events
      canALifted: {
        type: Expr.Type.Event,
        eventId: 'canALifted',
      },
      canBLifted: {
        type: Expr.Type.Event,
        eventId: 'canBLifted',
      },
      canCLifted: {
        type: Expr.Type.Event,
        eventId: 'canCLifted',
      },
      // Lift once Logic
      aLiftedOnce: {
        type: Expr.Type.Once,
        argId: 'canALifted',
      },
      bLiftedOnce: {
        type: Expr.Type.Once,
        argId: 'canBLifted',
      },
      cLiftedOnce: {
        type: Expr.Type.Once,
        argId: 'canCLifted',
      },
      // At least two cans lifted logic
      abLifted: {
        type: Expr.Type.And,
        argIds: ['aLiftedOnce', 'bLiftedOnce'],
      },
      acLifted: {
        type: Expr.Type.And,
        argIds: ['aLiftedOnce', 'cLiftedOnce'],
      },
      bcLifted: {
        type: Expr.Type.And,
        argIds: ['bLiftedOnce', 'cLiftedOnce'],
      },
      abcLifted: {
        type: Expr.Type.Or,
        argIds: ['abLifted', 'acLifted', 'bcLifted'],
      },
      // Place events
      canAPlaced: {
        type: Expr.Type.Event,
        eventId: 'canAPlaced',
      },
      canBPlaced: {
        type: Expr.Type.Event,
        eventId: 'canBPlaced',
      },
      canCPlaced: {
        type: Expr.Type.Event,
        eventId: 'canCPlaced',
      },
      // Upright events
      canAUpright: {
        type: Expr.Type.Event,
        eventId: 'canAUpright',
      },
      canBUpright: {
        type: Expr.Type.Event,
        eventId: 'canBUpright',
      },
      canCUpright: {
        type: Expr.Type.Event,
        eventId: 'canCUpright',
      },
      // Placed upright logic
      abPlacedUpright: {
        type: Expr.Type.And,
        argIds: ['canAPlaced', 'canAUpright', 'canBPlaced', 'canBUpright'],
      },
      acPlacedUpright: {
        type: Expr.Type.And,
        argIds: ['canAPlaced', 'canAUpright', 'canCPlaced', 'canCUpright'],
      },
      bcPlacedUpright: {
        type: Expr.Type.And,
        argIds: ['canBPlaced', 'canBUpright', 'canCPlaced', 'canCUpright'],
      },
      abcPlacedUpright: {
        type: Expr.Type.Or,
        argIds: ['abPlacedUpright', 'acPlacedUpright', 'bcPlacedUpright'],
      },
      // Success logic
      completion: {
        type: Expr.Type.And,
        argIds: ['abcLifted', 'abcPlacedUpright'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc6c',
} as Challenge;