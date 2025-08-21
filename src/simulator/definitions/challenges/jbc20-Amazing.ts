import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 20' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 20: A'mazing`,
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
    inStartBox: {
      name: { [LocalizedString.EN_US]: "In Start Box" },
      description: { [LocalizedString.EN_US]: "Robot in start box" },
    },
    ream1Touched: {
      name: { [LocalizedString.EN_US]: "Ream 1 Touched" },
      description: { [LocalizedString.EN_US]: "Robot touched ream 1" },
    },
    ream2Touched: {
      name: { [LocalizedString.EN_US]: "Ream 2 Touched" },
      description: { [LocalizedString.EN_US]: "Robot touched ream 2" },
    },
    ream3Touched: {
      name: { [LocalizedString.EN_US]: "Ream 3 Touched" },
      description: { [LocalizedString.EN_US]: "Robot touched ream 3" },
    },
    ream4Touched: {
      name: { [LocalizedString.EN_US]: "Ream 4 Touched" },
      description: { [LocalizedString.EN_US]: "Robot touched ream 4" },
    },
  },
  success: {
    exprs: {
      inStartBox: {
        type: Expr.Type.Event,
        eventId: 'inStartBox',
      },
      inStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'inStartBox',
      },
      ream1Touched: {
        type: Expr.Type.Event,
        eventId: 'ream1Touched',
      },
      ream1TouchedOnce: {
        type: Expr.Type.Once,
        argId: 'ream1Touched',
      },
      ream2Touched: {
        type: Expr.Type.Event,
        eventId: 'ream2Touched',
      },
      ream2TouchedOnce: {
        type: Expr.Type.Once,
        argId: 'ream2Touched',
      },
      ream3Touched: {
        type: Expr.Type.Event,
        eventId: 'ream3Touched',
      },
      ream3TouchedOnce: {
        type: Expr.Type.Once,
        argId: 'ream3Touched',
      },
      ream4Touched: {
        type: Expr.Type.Event,
        eventId: 'ream4Touched',
      },
      ream4TouchedOnce: {
        type: Expr.Type.Once,
        argId: 'ream4Touched',
      },

      completion: {
        type: Expr.Type.And,
        argIds: [
          'inStartBoxOnce',
          'ream1TouchedOnce',
          'ream2TouchedOnce',
          'ream3TouchedOnce',
          'ream4TouchedOnce',
        ],
      },
    },
    rootId: 'completion',
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: { [LocalizedString.EN_US]: 'Start in the Start Box' } },
    { exprId: 'ream1TouchedOnce', name: { [LocalizedString.EN_US]: 'Touch ream 1' } },
    { exprId: 'ream2TouchedOnce', name: { [LocalizedString.EN_US]: 'Touch ream 2' } },
    { exprId: 'ream3TouchedOnce', name: { [LocalizedString.EN_US]: 'Touch ream 3' } },
    { exprId: 'ream4TouchedOnce', name: { [LocalizedString.EN_US]: 'Touch ream 4' } },
  ],
  sceneId: 'jbc20',
} as Challenge;
