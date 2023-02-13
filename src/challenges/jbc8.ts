import Author from '../db/Author';
import Challenge from '../state/State/Challenge';
import Expr from '../state/State/Challenge/Expr';
import LocalizedString from '../util/LocalizedString';

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 8' },
  description: {
    [LocalizedString.EN_US]: 'Junior Botball Challenge 8: Serpentine',
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
    passed1: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 1' },
      description: { [LocalizedString.EN_US]: 'Robot passed through circle 1' },
    },
    passed2: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 2' },
      description: { [LocalizedString.EN_US]: 'Robot passed through circle 2' },
    },
    passed3: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 3' },
      description: { [LocalizedString.EN_US]: 'Robot passed through circle 3' },
    },
    passed4: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 4' },
      description: { [LocalizedString.EN_US]: 'Robot passed through circle 4' },
    },
    passed5: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 5' },
      description: { [LocalizedString.EN_US]: 'Robot passed through circle 5' },
    },
    passed6: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 6' },
      description: { [LocalizedString.EN_US]: 'Robot passed through circle 6' },
    },
    passed7: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 7' },
      description: { [LocalizedString.EN_US]: 'Robot passed through circle 7' },
    },
    passed8: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 8' },
      description: { [LocalizedString.EN_US]: 'Robot passed through circle 8' },
    },
  },
  success: {
    exprs: {
      //Start Box Event
      start: {
        type: Expr.Type.Event,
        eventId: 'start',
      },
      startOnce: {
        type: Expr.Type.Once,
        argId: 'start',
      },

      //Passed Through Circles Events
      passed1: {
        type: Expr.Type.Event,
        eventId: 'passed1',
      },
      passed1Once: {
        type: Expr.Type.Once,
        argId: 'passed1',
      },

      passed2: {
        type: Expr.Type.Event,
        eventId: 'passed2',
      },
      passed2Once: {
        type: Expr.Type.Once,
        argId: 'passed2',
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
      passed6: {
        type: Expr.Type.Event,
        eventId: 'passed6',
      },
      passed6Once: {
        type: Expr.Type.Once,
        argId: 'passed6',
      },
      passed7: {
        type: Expr.Type.Event,
        eventId: 'passed7',
      },
      passed7Once: {
        type: Expr.Type.Once,
        argId: 'passed7',
      },
      passed8: {
        type: Expr.Type.Event,
        eventId: 'passed8',
      },
      passed8Once: {
        type: Expr.Type.Once,
        argId: 'passed8',
      },
      

      passedSerpentine: {
        type: Expr.Type.And,
        argIds: ["passed1Once", "passed2Once","passed3Once", "passed4Once", "passed5Once", "passed6Once", "passed7Once", "passed8Once"],
      },

      // Success logic
      completion: {
        type: Expr.Type.And,
        argIds: ['startOnce', 'passedSerpentine'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc8',
} as Challenge;
