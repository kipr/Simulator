import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 4' },
  description: {
    [LocalizedString.EN_US]: 'Junior Botball Challenge 4: Serpentine',
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
    notInStartBox: {
      name: { [LocalizedString.EN_US]: 'Robot not in Start Box' },
      description: { [LocalizedString.EN_US]: 'Robot not in start box' },
    },
    wrongOrder: {
      name: { [LocalizedString.EN_US]: 'Circle Touched Out of Order' },
      description: { [LocalizedString.EN_US]: 'Circle was touched out of order' },
    },
    touched1: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 1' },
      description: { [LocalizedString.EN_US]: 'Robot touched circle 1' },
    },
    touched2: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 2' },
      description: { [LocalizedString.EN_US]: 'Robot touched circle 2' },
    },
    touched3: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 3' },
      description: { [LocalizedString.EN_US]: 'Robot touched circle 3' },
    },
    touched4: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 4' },
      description: { [LocalizedString.EN_US]: 'Robot touched circle 4' },
    },
    touched5: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 5' },
      description: { [LocalizedString.EN_US]: 'Robot touched circle 5' },
    },
    touched6: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 6' },
      description: { [LocalizedString.EN_US]: 'Robot touched circle 6' },
    },
    touched7: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 7' },
      description: { [LocalizedString.EN_US]: 'Robot touched circle 7' },
    },
    touched8: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Circle 8' },
      description: { [LocalizedString.EN_US]: 'Robot touched circle 8' },
    },
  },
  success: {
    exprs: {
      // Start Box Events
      notInStartBox: {
        type: Expr.Type.Event,
        eventId: "notInStartBox",
      },
      inStartBox: {
        type: Expr.Type.Not,
        argId: "notInStartBox",
      },
      inStartBoxOnce: {
        type: Expr.Type.Once,
        argId: "inStartBox",
      },

      // Touched Circles Events
      touched1: {
        type: Expr.Type.Event,
        eventId: 'touched1',
      },
      touched1Once: {
        type: Expr.Type.Once,
        argId: 'touched1',
      },
      touched2: {
        type: Expr.Type.Event,
        eventId: 'touched2',
      },
      touched2Once: {
        type: Expr.Type.Once,
        argId: 'touched2',
      },
      touched3: {
        type: Expr.Type.Event,
        eventId: 'touched3',
      },
      touched3Once: {
        type: Expr.Type.Once,
        argId: 'touched3',
      },
      touched4: {
        type: Expr.Type.Event,
        eventId: 'touched4',
      },
      touched4Once: {
        type: Expr.Type.Once,
        argId: 'touched4',
      },
      touched5: {
        type: Expr.Type.Event,
        eventId: 'touched5',
      },
      touched5Once: {
        type: Expr.Type.Once,
        argId: 'touched5',
      },
      touched6: {
        type: Expr.Type.Event,
        eventId: 'touched6',
      },
      touched6Once: {
        type: Expr.Type.Once,
        argId: 'touched6',
      },
      touched7: {
        type: Expr.Type.Event,
        eventId: 'touched7',
      },
      touched7Once: {
        type: Expr.Type.Once,
        argId: 'touched7',
      },
      touched8: {
        type: Expr.Type.Event,
        eventId: 'touched8',
      },
      touched8Once: {
        type: Expr.Type.Once,
        argId: 'touched8',
      },

      passedSerpentine: {
        type: Expr.Type.And,
        argIds: ['touched1Once', 'touched2Once', 'touched3Once', 'touched4Once', 'touched5Once', 'touched6Once', 'touched7Once', 'touched8Once'],
      },

      // Success logic
      completion: {
        type: Expr.Type.And,
        argIds: ['inStartBoxOnce', 'passedSerpentine'],
      },
    },
    rootId: 'completion',
  },
  failure: {
    exprs: {
      wrongOrder: {
        type: Expr.Type.Event,
        eventId: 'wrongOrder',
      },
      wrongOrderOnce: {
        type: Expr.Type.Once,
        argId: 'wrongOrder'
      },

      failure: {
        type: Expr.Type.And,
        argIds: [
          'wrongOrderOnce',
        ],
      },
    },
    rootId: "failure"
  },
  successGoals: [
    {
      exprId: 'inStartBoxOnce',
      name: { [LocalizedString.EN_US]: 'Start in the Start Box' },
    },
    { exprId: 'touched1Once', name: { [LocalizedString.EN_US]: 'Touch circle 1' } },
    { exprId: 'touched2Once', name: { [LocalizedString.EN_US]: 'Touch circle 2' } },
    { exprId: 'touched3Once', name: { [LocalizedString.EN_US]: 'Touch circle 3' } },
    { exprId: 'touched4Once', name: { [LocalizedString.EN_US]: 'Touch circle 4' } },
    { exprId: 'touched5Once', name: { [LocalizedString.EN_US]: 'Touch circle 5' } },
    { exprId: 'touched6Once', name: { [LocalizedString.EN_US]: 'Touch circle 6' } },
    { exprId: 'touched7Once', name: { [LocalizedString.EN_US]: 'Touch circle 7' } },
    { exprId: 'touched8Once', name: { [LocalizedString.EN_US]: 'Touch circle 8' } },
  ],
  failureGoals: [
    {
      exprId: 'wrongOrderOnce',
      name: { [LocalizedString.EN_US]: 'Circle touched out of order' },
    },
  ],
  sceneId: 'jbc4',
} as Challenge;
