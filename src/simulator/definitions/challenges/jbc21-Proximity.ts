import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 21'),
  description: tr(`Junior Botball Challenge 21: Proximity`),
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
    stopAtReam: {
      name: tr("Stop at Ream"),
      description: tr("Robot stops at ream"),
    },
    touchedReam: {
      name: tr("Bump Ream"),
      description: tr("Robot bumps ream"),
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
      stopAtReam: {
        type: Expr.Type.Event,
        eventId: 'stopAtReam',
      },

      completion: {
        type: Expr.Type.And,
        argIds: [
          'inStartBoxOnce',
          'stopAtReam',
        ],
      },
    },
    rootId: 'completion',
  },
  failure: {
    exprs: {
      // Ream Touching Events
      touchedReam: {
        type: Expr.Type.Event,
        eventId: 'touchedReam',
      },
      touchedReamOnce: {
        type: Expr.Type.Once,
        argId: 'touchedReam',
      },

      failure: {
        type: Expr.Type.And,
        argIds: [
          'touchedReamOnce',
        ],
      },
    },
    rootId: 'failure',
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'stopAtReam', name: tr('Stop at the ream') },
  ],
  failureGoals: [
    { exprId: 'touchedReamOnce', name: tr('Touch the ream') },
  ],
  sceneId: 'jbc21',
} as Challenge;
