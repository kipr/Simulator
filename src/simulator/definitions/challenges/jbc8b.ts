import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 8B' },
  description: {
    [LocalizedString.EN_US]: 'Junior Botball Challenge 8B: Serpentine Jr.',
  },
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


      passedSerpentine: {
        type: Expr.Type.And,
        argIds: ["passed1Once", "passed2Once","passed3Once", "passed4Once", "passed5Once"],
      },

      // Success logic
      completion: {
        type: Expr.Type.And,
        argIds: ['startOnce', 'passedSerpentine'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc8b',
} as Challenge;
