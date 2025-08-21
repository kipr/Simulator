import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 3' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 3: Precision Parking`,
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
    touchGarageLines: {
      name: { [LocalizedString.EN_US]: 'Robot Touched Garage Lines' },
      description: {
        [LocalizedString.EN_US]: 'Robot touched garage boundaries',
      },
    },
    singleGarageRun1: {
      name: { [LocalizedString.EN_US]: 'Robot Parked in One Garage' },
      description: {
        [LocalizedString.EN_US]: 'Robot parked in only one garage',
      },
    },
    singleGarageRun2: {
      name: { [LocalizedString.EN_US]: 'Robot Parked in Different Garage' },
      description: {
        [LocalizedString.EN_US]: 'Robot parked in a different garage',
      },
    },
    returnStartBox: {
      name: { [LocalizedString.EN_US]: 'Robot Returned Start' },
      description: { [LocalizedString.EN_US]: 'Robot returned to starting box' },
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
      name: { [LocalizedString.EN_US]: 'Start in the Start Box' },
    },
    {
      exprId: 'singleGarageRun1Once',
      name: { [LocalizedString.EN_US]: 'Park in one garage' },
    },
    {
      exprId: 'singleGarageRun2Once',
      name: { [LocalizedString.EN_US]: 'Park in a different garage' },
    },
    {
      exprId: 'returnStartBoxOnce',
      name: { [LocalizedString.EN_US]: 'Return to the Start Box' },
    },
  ],
  failureGoals: [
    {
      exprId: 'touchGarageLines',
      name: { [LocalizedString.EN_US]: 'Do not touch garage boundaries' },
    },
  ],
  sceneId: 'jbc3',
} as Challenge;
