import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 19' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 19: Bump`,
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
    driveForwardTouch: {
      name: { [LocalizedString.EN_US]: 'Robot Forward Touch' },
      description: {
        [LocalizedString.EN_US]:
          'Robot drove forward and touched ream of paper',
      },
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
  sceneId: 'jbc19',
} as Challenge;
