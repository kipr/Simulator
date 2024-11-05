import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 21' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 21: Proximity`,
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
      name: { [LocalizedString.EN_US]: "Robot not in Start Box" },
      description: { [LocalizedString.EN_US]: "Robot not in start box" },
    },
    stopAtReam: {
      name: { [LocalizedString.EN_US]: "Stop at Ream" },
      description: { [LocalizedString.EN_US]: "Robot stops at ream" },
    },
    touchedReam: {
      name: { [LocalizedString.EN_US]: "Bump Ream" },
      description: { [LocalizedString.EN_US]: "Robot bumps ream" },
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
  sceneId: 'jbc21',
} as Challenge;
