import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 22' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 22: Search and Rescue`,
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
    canInStartBox: {
      name: { [LocalizedString.EN_US]: "Can in Start Box" },
      description: { [LocalizedString.EN_US]: "Can in start box" },
    },
    canUpright: {
      name: { [LocalizedString.EN_US]: "Can Upright" },
      description: { [LocalizedString.EN_US]: "Can is upright" },
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
  sceneId: 'jbc22',
} as Challenge;
