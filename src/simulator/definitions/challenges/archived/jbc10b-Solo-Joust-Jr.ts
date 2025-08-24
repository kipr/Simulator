import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 10B'),
  description: tr(`Junior Botball Challenge 10B: Solo Joust Jr.`),
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
   
    can1Upright: {
      name: tr('Can A Upright'),
      description: tr('Can A upright in a circle'),
    },
    leaveStartBox: {
      name: tr('Robot Left Start'),
      description: tr('Robot left starting box'),
    },
    robotTouchingLine: {
      name: tr('Robot Touching Line B'),
      description: tr('Robot is touching line B'),
    },

  },
  success: {
    exprs: {


      // Upright Events
      can1Upright: {
        type: Expr.Type.Event,
        eventId: 'can1Upright',
      },
      can1NotUpright: {
        type: Expr.Type.Not,
        argId: 'can1Upright',
      },
      
      // Line B Event
      robotTouchingLine: {
        type: Expr.Type.Event,
        eventId: 'robotTouchingLine',
      },
      robotNotTouchingLine: {
        type: Expr.Type.Not,
        argId: 'robotTouchingLine',
      },

      // Can 1 Not Upright and Robot Not Touching Line B
      NotUprightNotTouching: {
        type: Expr.Type.And,
        argIds: ['can1NotUpright', 'robotNotTouchingLine'],
      },

      // Start Box Events
      leaveStartBox: {
        type: Expr.Type.Event,
        eventId: 'leaveStartBox',
      },
      leaveStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'leaveStartBox',
      },


      completion: {
        type: Expr.Type.And,
        argIds: ['leaveStartBoxOnce', 'NotUprightNotTouching'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc10b',
} as Challenge;
