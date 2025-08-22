import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 4'),
  description: tr('Junior Botball Challenge 4: Serpentine'),
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
      name: tr('Robot not in Start Box'),
      description: tr('Robot not in start box'),
    },
    wrongOrder: {
      name: tr('Circle Touched Out of Order'),
      description: tr('Circle was touched out of order'),
    },
    touched1: {
      name: tr('Robot Touched Circle 1'),
      description: tr('Robot touched circle 1'),
    },
    touched2: {
      name: tr('Robot Touched Circle 2'),
      description: tr('Robot touched circle 2'),
    },
    touched3: {
      name: tr('Robot Touched Circle 3'),
      description: tr('Robot touched circle 3'),
    },
    touched4: {
      name: tr('Robot Touched Circle 4'),
      description: tr('Robot touched circle 4'),
    },
    touched5: {
      name: tr('Robot Touched Circle 5'),
      description: tr('Robot touched circle 5'),
    },
    touched6: {
      name: tr('Robot Touched Circle 6'),
      description: tr('Robot touched circle 6'),
    },
    touched7: {
      name: tr('Robot Touched Circle 7'),
      description: tr('Robot touched circle 7'),
    },
    touched8: {
      name: tr('Robot Touched Circle 8'),
      description: tr('Robot touched circle 8'),
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
      name: tr('Start in the Start Box'),
    },
    { exprId: 'touched1Once', name: tr('Touch circle 1') },
    { exprId: 'touched2Once', name: tr('Touch circle 2') },
    { exprId: 'touched3Once', name: tr('Touch circle 3') },
    { exprId: 'touched4Once', name: tr('Touch circle 4') },
    { exprId: 'touched5Once', name: tr('Touch circle 5') },
    { exprId: 'touched6Once', name: tr('Touch circle 6') },
    { exprId: 'touched7Once', name: tr('Touch circle 7') },
    { exprId: 'touched8Once', name: tr('Touch circle 8') },
  ],
  failureGoals: [
    {
      exprId: 'wrongOrderOnce',
      name: tr('Circle touched out of order'),
    },
  ],
  sceneId: 'jbc4',
} as Challenge;
