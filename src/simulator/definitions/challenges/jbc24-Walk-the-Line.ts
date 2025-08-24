import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 24'),
  description: tr(`Junior Botball Challenge 24: Walk the Line`),
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
      description: tr('Robot uses reflectance sensor to follow the black line until Finish Line '),
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
  successGoals: [
    { exprId: 'lineFollow', name: tr('Line follow to the finish line') },
  ],
  sceneId: 'jbc24',
} as Challenge;
