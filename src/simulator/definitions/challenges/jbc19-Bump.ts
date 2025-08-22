import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 19'),
  description: tr(`Junior Botball Challenge 19: Bump`),
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
      name: tr("Robot not in Start Box"),
      description: tr("Robot not in start box"),
    },
    driveForwardTouch: {
      name: tr('Robot Forward Touch'),
      description: tr('Robot drove forward and touched ream of paper'),
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

      // Ream Touching Events
      driveForwardTouch: {
        type: Expr.Type.Event,
        eventId: 'driveForwardTouch',
      },

      completion: {
        type: Expr.Type.And,
        argIds: [
          'inStartBoxOnce',
          'driveForwardTouch',
        ],
      },
    },
    rootId: 'completion',
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'driveForwardTouch', name: tr('Drive forward and touch the ream') },
  ],
  sceneId: 'jbc19',
} as Challenge;
