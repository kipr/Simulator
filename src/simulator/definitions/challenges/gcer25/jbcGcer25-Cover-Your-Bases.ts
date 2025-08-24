import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from '../../../../programming/compiler/ProgrammingLanguage';

import tr from '@i18n';

export default {
  name: tr('GCER 2025: Cover Your Bases'),
  description: tr('GCER 2025 special edition. All circles are now open for business!'),
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
    canAUpright: {
      name: tr('Can A Upright'),
      description: tr('Can A upright in a circle'),
    },
    canBUpright: {
      name: tr('Can B Upright'),
      description: tr('Can B upright in a circle'),
    },
    canCUpright: {
      name: tr('Can C Upright'),
      description: tr('Can C upright in a circle'),
    },
    canDUpright: {
      name: tr('Can D Upright'),
      description: tr('Can D upright in a circle'),
    },
    canEUpright: {
      name: tr('Can E Upright'),
      description: tr('Can E upright in a circle'),
    },
    canFUpright: {
      name: tr('Can F Upright'),
      description: tr('Can F upright in a circle'),
    },
    canGUpright: {
      name: tr('Can G Upright'),
      description: tr('Can G upright in a circle'),
    },
    baseACovered: {
      name: tr('Base A Covered'),
      description: tr('Base A covered by a can'),
    },
    baseBCovered: {
      name: tr('Base B Covered'),
      description: tr('Base B covered by a can'),
    },
    baseCCovered: {
      name: tr('Base C Covered'),
      description: tr('Base C covered by a can'),
    },
    baseDCovered: {
      name: tr('Base D Covered'),
      description: tr('Base D covered by a can'),
    },
    baseECovered: {
      name: tr('Base E Covered'),
      description: tr('Base E covered by a can'),
    },
    baseFCovered: {
      name: tr('Base F Covered'),
      description: tr('Base F covered by a can'),
    },
    baseGCovered: {
      name: tr('Base G Covered'),
      description: tr('Base G covered by a can'),
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

      // Circles Covered Events
      baseACovered: {
        type: Expr.Type.Event,
        eventId: 'baseACovered',
      },
      baseBCovered: {
        type: Expr.Type.Event,
        eventId: 'baseBCovered',
      },
      baseCCovered: {
        type: Expr.Type.Event,
        eventId: 'baseCCovered',
      },
      baseDCovered: {
        type: Expr.Type.Event,
        eventId: 'baseDCovered',
      },
      baseECovered: {
        type: Expr.Type.Event,
        eventId: 'baseECovered',
      },
      baseFCovered: {
        type: Expr.Type.Event,
        eventId: 'baseFCovered',
      },
      baseGCovered: {
        type: Expr.Type.Event,
        eventId: 'baseGCovered',
      },
      allBasesCovered: {
        type: Expr.Type.And,
        argIds: ['baseACovered', 'baseBCovered', 'baseCCovered', 'baseDCovered', 'baseECovered', 'baseFCovered', 'baseGCovered'],
      },

      // Upright Events
      canAUpright: {
        type: Expr.Type.Event,
        eventId: 'canAUpright',
      },
      canANotUpright: {
        type: Expr.Type.Not,
        argId: 'canAUpright',
      },
      canBUpright: {
        type: Expr.Type.Event,
        eventId: 'canBUpright',
      },
      canBNotUpright: {
        type: Expr.Type.Not,
        argId: 'canBUpright',
      },
      canCUpright: {
        type: Expr.Type.Event,
        eventId: 'canCUpright',
      },
      canCNotUpright: {
        type: Expr.Type.Not,
        argId: 'canCUpright',
      },
      canDUpright: {
        type: Expr.Type.Event,
        eventId: 'canDUpright',
      },
      canDNotUpright: {
        type: Expr.Type.Not,
        argId: 'canDUpright',
      },
      canEUpright: {
        type: Expr.Type.Event,
        eventId: 'canEUpright',
      },
      canENotUpright: {
        type: Expr.Type.Not,
        argId: 'canEUpright',
      },
      canFUpright: {
        type: Expr.Type.Event,
        eventId: 'canFUpright',
      },
      canFNotUpright: {
        type: Expr.Type.Not,
        argId: 'canFUpright',
      },
      canGUpright: {
        type: Expr.Type.Event,
        eventId: 'canGUpright',
      },
      canGNotUpright: {
        type: Expr.Type.Not,
        argId: 'canGUpright',
      },
      allCansUpright: {
        type: Expr.Type.And,
        argIds: ['canAUpright', 'canBUpright', 'canCUpright', 'canDUpright', 'canEUpright', 'canFUpright', 'canGUpright'],
      },

      // Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: ['inStartBoxOnce', 'allBasesCovered', 'allCansUpright'],
      },
    },
    rootId: 'completion',
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'baseACovered', name: tr('Base A Covered') },
    { exprId: 'baseBCovered', name: tr('Base B Covered') },
    { exprId: 'baseCCovered', name: tr('Base C Covered') },
    { exprId: 'baseDCovered', name: tr('Base D Covered') },
    { exprId: 'baseECovered', name: tr('Base E Covered') },
    { exprId: 'baseFCovered', name: tr('Base F Covered') },
    { exprId: 'baseGCovered', name: tr('Base G Covered') },
  ],
  failureGoals: [
    { exprId: 'canANotUpright', name: tr('Can A Not Upright') },
    { exprId: 'canBNotUpright', name: tr('Can B Not Upright') },
    { exprId: 'canCNotUpright', name: tr('Can C Not Upright') },
    { exprId: 'canDNotUpright', name: tr('Can D Not Upright') },
    { exprId: 'canENotUpright', name: tr('Can E Not Upright') },
    { exprId: 'canFNotUpright', name: tr('Can F Not Upright') },
    { exprId: 'canGNotUpright', name: tr('Can G Not Upright') },
  ],
  sceneId: 'Cover_Your_Bases',
} as Challenge;
