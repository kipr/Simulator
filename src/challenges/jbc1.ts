import Author from '../db/Author';
import Challenge from '../state/State/Challenge';
import Expr from '../state/State/Challenge/Expr';
import LocalizedString from '../util/LocalizedString';

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 1' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 1: Tag, You're it!` },
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
    canATouched: {
      name: { [LocalizedString.EN_US]: 'Can A Touched' },
      description: { [LocalizedString.EN_US]: 'Can A touched' },
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
  sceneId: 'jbc1',
} as Challenge;