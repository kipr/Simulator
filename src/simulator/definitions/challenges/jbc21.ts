import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 21' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 21: Foot Tall`,
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
    footTallMark: {
      name: { [LocalizedString.EN_US]: 'Can 9 Lifted' },
      description: {
        [LocalizedString.EN_US]: 'Can 9 Lifted a Foot Tall',
      },
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
