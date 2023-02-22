import Author from '../db/Author';
import Challenge from '../state/State/Challenge';
import Expr from '../state/State/Challenge/Expr';
import LocalizedString from '../util/LocalizedString';

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 19' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 19: Mountain Rescue`,
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
    can1Upright: {
      name: { [LocalizedString.EN_US]: 'Can 1 Upright' },
      description: {
        [LocalizedString.EN_US]: 'Can 1 is upright',
      },
    },
    can2Upright: {
      name: { [LocalizedString.EN_US]: 'Can 2 Upright' },
      description: {
        [LocalizedString.EN_US]: 'Can 2 is upright',
      },
    },
    can3Upright: {
      name: { [LocalizedString.EN_US]: 'Can 3 Upright' },
      description: {
        [LocalizedString.EN_US]: 'Can 3 is upright',
      },
    },
    can1Intersects: {
      name: { [LocalizedString.EN_US]: 'Can 1 Intersects' },
      description: {
        [LocalizedString.EN_US]: 'Can 1 rescued intersecting starting box',
      },
    },
    can2Intersects: {
      name: { [LocalizedString.EN_US]: 'Can 2 Intersects' },
      description: {
        [LocalizedString.EN_US]: 'Can 2 rescued intersecting starting box',
      },
    },
    can3Intersects: {
      name: { [LocalizedString.EN_US]: 'Can 3 Intersects' },
      description: {
        [LocalizedString.EN_US]: 'Can 3 rescued intersecting starting box',
      },
    },
  },
  success: {
    exprs: {
      //Rescued upright can events
      can1Upright: {
        type: Expr.Type.Event,
        eventId: 'can1Upright',
      },
      can1UprightOnce: {
        type: Expr.Type.Once,
        argId: 'can1Upright',
      },
      can2Upright: {
        type: Expr.Type.Event,
        eventId: 'can2Upright',
      },
      can2UprightOnce: {
        type: Expr.Type.Once,
        argId: 'can2Upright',
      },
      can3Upright: {
        type: Expr.Type.Event,
        eventId: 'can3Upright',
      },
      can3UprightOnce: {
        type: Expr.Type.Once,
        argId: 'can3Upright',
      },

      //Rescued intersecting can events
      can1Intersects: {
        type: Expr.Type.Event,
        eventId: 'can1Intersects',
      },
      can1IntersectsOnce: {
        type: Expr.Type.Once,
        argId: 'can1Intersects',
      },
      can2Intersects: {
        type: Expr.Type.Event,
        eventId: 'can2Intersects',
      },
      can2IntersectsOnce: {
        type: Expr.Type.Once,
        argId: 'can2Intersects',
      },
      can3Intersects: {
        type: Expr.Type.Event,
        eventId: 'can3Intersects',
      },
      can3IntersectsOnce: {
        type: Expr.Type.Once,
        argId: 'can3Intersects',
      },

      //Intersecting and Upright
      IntersectingUpright1: {
        type: Expr.Type.And,
        argIds: ['can1UprightOnce','can1IntersectsOnce'],
      },
      IntersectingUpright2: {
        type: Expr.Type.And,
        argIds: ['can2UprightOnce','can2IntersectsOnce'],
      },
      IntersectingUpright3: {
        type: Expr.Type.And,
        argIds: ['can3UprightOnce','can3IntersectsOnce'],
      },


      completion: {
        type: Expr.Type.And,
        argIds: ['IntersectingUpright1','IntersectingUpright2','IntersectingUpright3'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc19',
} as Challenge;
