import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from '../../../../programming/compiler/ProgrammingLanguage';
import tr from '@i18n';

const circles = [4, 9, 11];
const CUP_EVENTS = {};
const CUP_EXPRS = {};
let CUP_ARGIDS: string[] = [];
for (const [i, n] of circles.entries()) {
  const eventId = `cup${i}_startbox`;
  const argId = `cup${i}_startbox_expr`;

  CUP_EVENTS[eventId] = {
    name: tr(`Cup ${n} startbox`),
    description: tr(`Cup ${n} in startbox`),
  };
  CUP_EXPRS[argId] = {
    type: Expr.Type.Event,
    eventId,
  };
  CUP_ARGIDS = CUP_ARGIDS.concat(argId);
}

export default {
  name: tr('GCER 2025: Thirst Quencher'),
  description: tr('GCER 2025 special event. Don\'t let the summer heat get you down. Bring the cups back to the start box!'),
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
    ...CUP_EVENTS,
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

      ...CUP_EXPRS,

      // Success Logic = Can 7 not upright, waited to chop, and began in start box
      completion: {
        type: Expr.Type.And,
        argIds: [
          'inStartBoxOnce',
          ...CUP_ARGIDS,
        ],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'Thirst_Quencher',
} as Challenge;
