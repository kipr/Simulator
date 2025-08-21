import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 12' },
  description: {
    [LocalizedString.EN_US]: 'Junior Botball Challenge 12: Add It Up',
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
    addItUp: {
      name: { [LocalizedString.EN_US]: 'Robot Touched a Circle ' },
      description: { [LocalizedString.EN_US]: 'Robot touched a circle' },
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
    { exprId: 'startOnce', name: { [LocalizedString.EN_US]: 'Start in the Start Box' } },
    { exprId: 'addItUpOnce', name: { [LocalizedString.EN_US]: 'Touched Circles to add up to 20' } }
  ],
  sceneId: 'jbc12',
} as Challenge;
