import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('Test'),
  description: tr('Test'),
  author: {
    type: Author.Type.Organization,
    id: 'kipr'
  },
  code: {
    'c': ProgrammingLanguage.DEFAULT_CODE.c,
    'cpp': ProgrammingLanguage.DEFAULT_CODE.cpp,
    'python': ProgrammingLanguage.DEFAULT_CODE.python,
  },
  defaultLanguage: 'c',
  events: {
    a: {
      name: tr('A'),
      description: tr('A'),
    },
    b: {
      name: tr('B'),
      description: tr('B'),
    }
  },
  success: {
    exprs: {
      and: {
        type: Expr.Type.And,
        argIds: ['a', 'b'],
      },
      a: {
        type: Expr.Type.Event,
        eventId: 'a',
      },
      b: {
        type: Expr.Type.Or,
        argIds: ['a', 'c'],
      },
      c: {
        type: Expr.Type.Event,
        eventId: 'b',
      }
    },
    rootId: 'and',
  },
  failure: {
    exprs: {
      b: {
        type: Expr.Type.Event,
        eventId: 'b',
      }
    },
    rootId: 'b',
  },
  sceneId: 'scriptPlayground',
} as Challenge;