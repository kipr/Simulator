import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import LocalizedString from '../../../../util/LocalizedString';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 10' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 10: Solo Joust`,
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
   
    can1Upright: {
      name: { [LocalizedString.EN_US]: 'Can A Upright' },
      description: {
        [LocalizedString.EN_US]: 'Can A upright in a circle',
      },
    },
    leaveStartBox: {
      name: { [LocalizedString.EN_US]: 'Robot Left Start' },
      description: { [LocalizedString.EN_US]: 'Robot left starting box' },
    },
    robotTouchingLine: {
      name: { [LocalizedString.EN_US]: 'Robot Touching Line B' },
      description: { [LocalizedString.EN_US]: 'Robot is touching line B' },
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
  sceneId: 'jbc10',
} as Challenge;
