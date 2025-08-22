import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 15B'),
  description: tr(`Junior Botball Challenge 15B: Bump Bump`),
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
    driveForwardTouch: {
      name: tr('Robot Forward Touch'),
      description: tr('Robot drove forward and touched ream of paper'),
    },

    driveBackwardTouch: {
      name: tr('Robot Backward Touch'),
      description: tr('Robot drove backward and touched ream of paper'),
    },
    driveForward2: {
      name: tr('Robot Forward Circle 2'),
      description: tr('Robot drove forward to circle 2'),
    },
  },
  success: {
    exprs: {
      // Ream Touching Events
      driveForwardTouch: {
        type: Expr.Type.Event,
        eventId: 'driveForwardTouch',
      },
      driveForwardTouchOnce: {
        type: Expr.Type.Once,
        argId: 'driveForwardTouch',
      },
      driveBackwardTouch: {
        type: Expr.Type.Event,
        eventId: 'driveBackwardTouch',
      },
      driveBackwardTouchOnce: {
        type: Expr.Type.Once,
        argId: 'driveBackwardTouch',
      },
      driveForward2: {
        type: Expr.Type.Event,
        eventId: 'driveForward2',
      },
      driveForward2Once: {
        type: Expr.Type.Once,
        argId: 'driveForward2',
      },

      completion: {
        type: Expr.Type.And,
        argIds: [
          'driveForwardTouchOnce',
          'driveBackwardTouchOnce',
          'driveForward2Once',
        ],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc15b',
} as Challenge;
