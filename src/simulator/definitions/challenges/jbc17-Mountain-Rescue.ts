import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 17'),
  description: tr(`Junior Botball Challenge 17: Mountain Rescue`),
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
      name: tr('Robot not in Start Box'),
      description: tr('Robot not in start box'),
    },
    can1Retrieved: {
      name: tr('Can 1 Rescued'),
      description: tr('Can 1 rescued'),
    },
    can2Retrieved: {
      name: tr('Can 2 Rescued'),
      description: tr('Can 2 rescued'),
    },
    can3Retrieved: {
      name: tr('Can 3 Rescued'),
      description: tr('Can 3 rescued'),
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

      can1Retrieved: {
        type: Expr.Type.Event,
        eventId: "can1Retrieved",
      },
      can2Retrieved: {
        type: Expr.Type.Event,
        eventId: "can2Retrieved",
      },
      can3Retrieved: {
        type: Expr.Type.Event,
        eventId: "can3Retrieved",
      },
      completion: {
        type: Expr.Type.And,
        argIds: ['inStartBoxOnce', 'can1Retrieved', 'can2Retrieved', 'can3Retrieved'],
      },
    },
    rootId: 'completion',
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'can1Retrieved', name: tr('Rescue can 1 to start box') },
    { exprId: 'can2Retrieved', name: tr('Rescue can 2 to start box') },
    { exprId: 'can3Retrieved', name: tr('Rescue can 3 to start box') },
  ],
  failureGoals: [],
  sceneId: 'jbc17',
} as Challenge;
