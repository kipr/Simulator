import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 3'),
  description: tr(`Junior Botball Challenge 3: Precision Parking`),
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
    touchGarageLines: {
      name: tr('Robot Touched Garage Lines'),
      description: tr('Robot touched garage boundaries'),
    },
    singleGarageRun1: {
      name: tr('Robot Parked in One Garage'),
      description: tr('Robot parked in only one garage'),
    },
    singleGarageRun2: {
      name: tr('Robot Parked in Different Garage'),
      description: tr('Robot parked in a different garage'),
    },
    returnStartBox: {
      name: tr('Robot Returned Start'),
      description: tr('Robot returned to starting box'),
    },
  },
  success: {
    exprs: {
      // Garage Events
      singleGarageRun1: {
        type: Expr.Type.Event,
        eventId: 'singleGarageRun1',
      },
      singleGarageRun1Once: {
        type: Expr.Type.Once,
        argId: 'singleGarageRun1',
      },
      singleGarageRun2: {
        type: Expr.Type.Event,
        eventId: 'singleGarageRun2',
      },
      singleGarageRun2Once: {
        type: Expr.Type.Once,
        argId: 'singleGarageRun2',
      },

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
      returnStartBox: {
        type: Expr.Type.Event,
        eventId: 'returnStartBox',
      },
      returnStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'returnStartBox',
      },

      completion: {
        type: Expr.Type.And,
        argIds: ['singleGarageRun1Once', 'inStartBoxOnce', 'returnStartBoxOnce', 'singleGarageRun2Once'],
      },
    },
    rootId: 'completion',
  },
  failure: {
    exprs: {
      touchGarageLines: {
        type: Expr.Type.Event,
        eventId: 'touchGarageLines',
      },


      failure: {
        type: Expr.Type.And,
        argIds: ['touchGarageLines'],
      },
    },
    rootId: 'failure',
  },
  successGoals: [
    {
      exprId: 'inStartBoxOnce',
      name: tr('Start in the Start Box'),
    },
    {
      exprId: 'singleGarageRun1Once',
      name: tr('Park in one garage'),
    },
    {
      exprId: 'returnStartBoxOnce',
      name: tr('Return to the Start Box'),
    },
    {
      exprId: 'singleGarageRun2Once',
      name: tr('Park in a different garage'),
    },
  ],
  failureGoals: [
    {
      exprId: 'touchGarageLines',
      name: tr('Do not touch garage boundaries'),
    },
  ],
  sceneId: 'jbc3',
} as Challenge;
