import Author from '../db/Author';
import Challenge from '../state/State/Challenge';
import Expr from '../state/State/Challenge/Expr';
import LocalizedString from '../util/LocalizedString';

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 17' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 17: Walk the Line`,
  },
  author: {
    type: Author.Type.Organization,
    id: 'kipr',
    //COMME
  },
  code: {
    c: `#include <kipr/botball.h>`,
    cpp: `#include <kipr/botball.h>`,
    python: `from kipr import botball`,
  },
  defaultLanguage: 'c',
  events: {
    lineFollow: {
      name: { [LocalizedString.EN_US]: 'Robot Walks the Line' },
      description: {
        [LocalizedString.EN_US]:
          'Robot uses reflectance sensor to follow the black line until Finish Line ',
      },
    },
  },
  success: {
    exprs: {
      //Line Following Event
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
  sceneId: 'jbc17',
} as Challenge;
