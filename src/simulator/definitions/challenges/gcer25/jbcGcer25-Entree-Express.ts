import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from '../../../../programming/compiler/ProgrammingLanguage';

import tr from '@i18n';

export default {
  name: tr('GCER 2025: Entree Express'),
  description: tr('GCER 2025 special event. Order up! Move the entrees to the trays.'),
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
    burgerTray: {
      name: tr('Hamburger placed'),
      description: tr('Hamburger placed in tray'),
    },
    dogTray: {
      name: tr('Hotdog placed'),
      description: tr('Hotdog placed in tray'),
    },
    tacoTray: {
      name: tr('Taco placed'),
      description: tr('Taco placed in tray'),
    },
  },
  success: {
    exprs: {
      // Start Box Events
      notInStartBox: {
        type: Expr.Type.Event,
        eventId: 'notInStartBox',
      },
      inStartBox: {
        type: Expr.Type.Not,
        argId: 'notInStartBox',
      },
      inStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'inStartBox',
      },

      // Passing side events
      burgerTray: {
        type: Expr.Type.Event,
        eventId: 'burgerTray',
      },
      dogTray: {
        type: Expr.Type.Event,
        eventId: 'dogTray',
      },
      tacoTray: {
        type: Expr.Type.Event,
        eventId: 'tacoTray',
      },
      completion: {
        type: Expr.Type.And,
        argIds: [
          'inStartBoxOnce',
          'burgerTray',
          'dogTray',
          'tacoTray',
        ],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'Entree_Express',
} as Challenge;
