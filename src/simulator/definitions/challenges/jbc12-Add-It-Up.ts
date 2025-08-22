import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 12'),
  description: tr('Junior Botball Challenge 12: Add It Up'),
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
      name: tr('Robot Begins In start'),
      description: tr('Robot begins in starting box'),
    },
    addItUp: {
      name: tr('Robot Touched a Circle '),
      description: tr('Robot touched a circle'),
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

      addItUp: {
        type: Expr.Type.Event,
        eventId: 'addItUp',
      },
      addItUpOnce: {
        type: Expr.Type.Once,
        argId: 'addItUp',
      },

      // Success logic
      completion: {
        type: Expr.Type.And,
        argIds: ['startOnce', 'addItUpOnce'],
      },
    },
    rootId: 'completion',
  },
  successGoals: [
    { exprId: 'startOnce', name: tr('Start in the Start Box') },
    { exprId: 'addItUpOnce', name: tr('Touched Circles to add up to 20') }
  ],
  sceneId: 'jbc12',
} as Challenge;
