import Author from '../db/Author';
import Challenge from '../state/State/Challenge';
import Expr from '../state/State/Challenge/Expr';
import LocalizedString from '../util/LocalizedString';

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 3' },
  description: {
    [LocalizedString.EN_US]: 'Junior Botball Challenge 3: Precision Parking',
  },
  author: {
    type: Author.Type.Organization,
    id: 'kipr',
  },
  code: {
    c: `#include <kipr/botball.h>`,
    cpp: `#include <kipr/botball.h>`,
    python: `from kipr import botball`,
  },
  defaultLanguage: 'c',
  events: {
    start: {
      name: { [LocalizedString.EN_US]: 'Robot Begins In start' },
      description: { [LocalizedString.EN_US]: 'Robot begins in starting box' },
    },
    singleGarageRun: {
      name: { [LocalizedString.EN_US]: 'Robot Park in One Garage' },
      description: {
        [LocalizedString.EN_US]: 'Robot parks in only one garage',
      },
    },
    doubleGarageRun: {
      name: { [LocalizedString.EN_US]: 'Robot Park in Two Garages' },
      description: { [LocalizedString.EN_US]: 'Robot parks in two garages' },
    },
  },
  success: {
    exprs: {
      // Start Box Event
      start: {
        type: Expr.Type.Event,
        eventId: 'start',
      },
      startOnce: {
        type: Expr.Type.Once,
        argId: 'start',
      },

      // Single or Double Garage Run Events
      singleGarageRun: {
        type: Expr.Type.Event,
        eventId: 'singleGarageRun',
      },
     

      doubleGarageRun: {
        type: Expr.Type.Event,
        eventId: 'doubleGarageRun',
      },
      
      passed3: {
        type: Expr.Type.Event,
        eventId: 'passed3',
      },
      passed3Once: {
        type: Expr.Type.Once,
        argId: 'passed3',
      },
      passed4: {
        type: Expr.Type.Event,
        eventId: 'passed4',
      },
      passed4Once: {
        type: Expr.Type.Once,
        argId: 'passed4',
      },
      passed5: {
        type: Expr.Type.Event,
        eventId: 'passed5',
      },
      passed5Once: {
        type: Expr.Type.Once,
        argId: 'passed5',
      },

      passedSerpentine: {
        type: Expr.Type.And,
        argIds: [
          'passed1Once',
          'passed2Once',
          'passed3Once',
          'passed4Once',
          'passed5Once',
        ],
      },

      // Success logic
      completion: {
        type: Expr.Type.Or,
        argIds: ['singleGarageRun', 'doubleGarageRun'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc3',
} as Challenge;
