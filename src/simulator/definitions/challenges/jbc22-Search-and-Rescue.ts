import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 22'),
  description: tr(`Junior Botball Challenge 22: Search and Rescue`),
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
    canInStartBox: {
      name: tr("Can in Start Box"),
      description: tr("Can in start box"),
    },
    canUpright: {
      name: tr("Can Upright"),
      description: tr("Can is upright"),
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

      // Can Events
      canInStartBox: {
        type: Expr.Type.Event,
        eventId: "canInStartBox",
      },
      canUpright: {
        type: Expr.Type.Event,
        eventId: "canUpright",
      },
      canNotUpright: {
        type: Expr.Type.Not,
        argId: "canUpright",
      },

      completion: {
        type: Expr.Type.And,
        argIds: [
          'inStartBoxOnce',
          'canInStartBox',
          'canUpright',
        ],
      },
    },
    rootId: 'completion',
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'canInStartBox', name: tr('Bring can to Start Box') },
  ],
  failureGoals: [
    { exprId: 'canNotUpright', name: tr('Can not upright') },
  ],
  sceneId: 'jbc22',
} as Challenge;
