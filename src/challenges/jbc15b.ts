import Author from '../db/Author';
import Challenge from '../state/State/Challenge';
import Expr from '../state/State/Challenge/Expr';
import LocalizedString from '../util/LocalizedString';

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 15B' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 15B: Bump Bump`,
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
    driveForwardTouch: {
      name: { [LocalizedString.EN_US]: 'Robot Forward Touch' },
      description: {
        [LocalizedString.EN_US]:
          'Robot drove forward and touched ream of paper',
      },
    },

    driveBackwardTouch: {
      name: { [LocalizedString.EN_US]: 'Robot Backward Touch' },
      description: {
        [LocalizedString.EN_US]:
          'Robot drove backward and touched ream of paper',
      },
    },
    driveForward2: {
      name: { [LocalizedString.EN_US]: 'Robot Forward Circle 2' },
      description: {
        [LocalizedString.EN_US]: 'Robot drove forward to circle 2',
      },
    },
  },
  success: {
    exprs: {
      //Ream Touching Events
      driveForwardTouch: {
        type: Expr.Type.Event,
        eventId: 'driveForwardTouch',
      },
      driveForwardTouchOnce: {
        type: Expr.Type.Once,
        argId: 'driveForwardTouch',
      },
      driveBackwardTouch: {
        type: Expr.Type.Event,
        eventId: 'driveBackwardTouch',
      },
      driveBackwardTouchOnce: {
        type: Expr.Type.Once,
        argId: 'driveBackwardTouch',
      },
      driveForward2: {
        type: Expr.Type.Event,
        eventId: 'driveForward2',
      },
      driveForward2Once: {
        type: Expr.Type.Once,
        argId: 'driveForward2',
      },

      completion: {
        type: Expr.Type.And,
        argIds: [
          'driveForwardTouchOnce',
          'driveBackwardTouchOnce',
          'driveForward2Once',
        ],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc15b',
} as Challenge;
