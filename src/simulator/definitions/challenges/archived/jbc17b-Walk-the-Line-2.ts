import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 17B'),
  description: tr(`Junior Botball Challenge 17B: Walk the Line II`),
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
    lineFollow: {
      name: tr('Robot Walks the Line'),
      description: tr('Robot uses reflectance sensor to follow the black line until the Blue line'),
    },
  },
  success: {
    exprs: {
      // Line Following Event
      lineFollow: {
        type: Expr.Type.Event,
        eventId: 'lineFollow',
      },
    

      completion: {
        type: Expr.Type.And,
        argIds: [
          'lineFollow',
        ],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc17b',
} as Challenge;
