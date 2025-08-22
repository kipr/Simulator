import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 21'),
  description: tr(`Junior Botball Challenge 21: Foot Tall`),
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
    footTallMark: {
      name: tr('Can 9 Lifted'),
      description: tr('Can 9 Lifted a Foot Tall'),
    },
  },
  success: {
    exprs: {
      footTallMark: {
        type: Expr.Type.Event,
        eventId: 'footTallMark',
      },

      completion: {
        type: Expr.Type.And,
        argIds: ['footTallMark'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc21',
} as Challenge;
