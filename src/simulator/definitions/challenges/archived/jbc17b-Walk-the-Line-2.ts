import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import LocalizedString from '../../../../util/LocalizedString';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 17B' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 17B: Walk the Line II`,
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
    lineFollow: {
      name: { [LocalizedString.EN_US]: 'Robot Walks the Line' },
      description: {
        [LocalizedString.EN_US]:
          'Robot uses reflectance sensor to follow the black line until the Blue line',
      },
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
