import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from '../../../../programming/compiler/ProgrammingLanguage';
import tr from '@i18n';

const POM_EVENTS = {};
const POM_EXPRS = {};
const POM_ONCES = {};
let POM_ARGIDS: string[] = [];
for (let i = 0; i < 12; i++) {
  const eventId = `pom_blue${i}`;
  const argId = `pom_blue${i}_hit_botguy`;
  const onceId = `${i}hit_botguy_once`;

  POM_EVENTS[eventId] = {
    name: tr(`Blue pom #${i + 1} Collision`),
    description: tr(`Blue pom #${i + 1} hit botguy`),
  };
  POM_EXPRS[argId] = {
    type: Expr.Type.Event,
    eventId,
  };
  POM_ONCES[onceId] = {
    type: Expr.Type.Once,
    argId,
  };
  POM_ARGIDS = POM_ARGIDS.concat(onceId);
}

export default {
  name: tr('GCER 2025: Ice Ice Botguy'),
  description: tr('GCER 2025 special event. Botguy is overheating! Collect the ice and dump it on Botguy to cool him off!'),
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
      ...POM_ONCES,
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
  sceneId: 'Ice_Ice_Botguy',
} as Challenge;
