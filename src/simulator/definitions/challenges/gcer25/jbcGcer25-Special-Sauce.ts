import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from '../../../../programming/compiler/ProgrammingLanguage';
import tr from '@i18n';

const pomPositions = [3, 5, 9, 2, 7, 11, 1, 8, 10];

const POM_EVENTS = {};
const POM_EXPRS = {};
let POM_ARGIDS: string[] = [];
for (const circle of pomPositions) {
  const eventId = `pom${circle}`;
  const argId = `pom${circle}in_garage`;

  POM_EVENTS[eventId] = {
    name: tr(`Pom #${circle} in garage`),
    description: tr(`Pom #${circle} in garage`),
  };
  POM_EXPRS[argId] = {
    type: Expr.Type.Event,
    eventId,
  };
  POM_ARGIDS = POM_ARGIDS.concat(argId);
}

export default {
  name: tr('GCER 2025: Special Sauce'),
  description: tr('GCER 2025 special event. Mix the ketchup (red), mustard (yellow), and hot sauce (orange) in the garages to create your own special blend!'),
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
    ...POM_EVENTS,
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
      ...POM_EXPRS,
      completion: {
        type: Expr.Type.And,
        argIds: [
          'inStartBoxOnce',
          ...POM_ARGIDS,
        ],
      },
    },
    rootId: 'completion',
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    ...pomPositions.map((n, i) => ({ exprId: `pom${n}in_garage`, name: tr(`Pom #${n} in Garage`) })),
  ],
  sceneId: 'Special_Sauce',
} as Challenge;
