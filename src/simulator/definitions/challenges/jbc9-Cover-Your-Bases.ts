import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 9' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 9: Cover Your Bases`,
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
    notInStartBox: {
      name: { [LocalizedString.EN_US]: 'Robot not in Start Box' },
      description: { [LocalizedString.EN_US]: 'Robot not in start box' },
    },
    canAUpright: {
      name: { [LocalizedString.EN_US]: 'Can A Upright' },
      description: { [LocalizedString.EN_US]: 'Can A upright in a circle', },
    },
    canBUpright: {
      name: { [LocalizedString.EN_US]: 'Can B Upright' },
      description: { [LocalizedString.EN_US]: 'Can B upright in a circle', },
    },
    canCUpright: {
      name: { [LocalizedString.EN_US]: 'Can C Upright' },
      description: { [LocalizedString.EN_US]: 'Can C upright in a circle', },
    },
    canDUpright: {
      name: { [LocalizedString.EN_US]: 'Can D Upright' },
      description: { [LocalizedString.EN_US]: 'Can D upright in a circle', },
    },
    canEUpright: {
      name: { [LocalizedString.EN_US]: 'Can E Upright' },
      description: { [LocalizedString.EN_US]: 'Can E upright in a circle', },
    },
    baseACovered: {
      name: { [LocalizedString.EN_US]: 'Base A Covered' },
      description: { [LocalizedString.EN_US]: 'Base A covered by a can', },
    },
    baseBCovered: {
      name: { [LocalizedString.EN_US]: 'Base B Covered' },
      description: { [LocalizedString.EN_US]: 'Base B covered by a can', },
    },
    baseCCovered: {
      name: { [LocalizedString.EN_US]: 'Base C Covered' },
      description: { [LocalizedString.EN_US]: 'Base C covered by a can', },
    },
    baseDCovered: {
      name: { [LocalizedString.EN_US]: 'Base D Covered' },
      description: { [LocalizedString.EN_US]: 'Base D covered by a can', },
    },
    baseECovered: {
      name: { [LocalizedString.EN_US]: 'Base E Covered' },
      description: { [LocalizedString.EN_US]: 'Base E covered by a can', },
    },
  },
  success: {
    exprs: {
      // Start Box Events
      notInStartBox: {
        type: Expr.Type.Event,
        eventId: "notInStartBox",
      },
      inStartBox: {
        type: Expr.Type.Not,
        argId: "notInStartBox",
      },
      inStartBoxOnce: {
        type: Expr.Type.Once,
        argId: "inStartBox",
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
      allBasesCovered: {
        type: Expr.Type.And,
        argIds: ['baseACovered', 'baseBCovered', 'baseCCovered', 'baseDCovered', 'baseECovered'],
      },

      // Upright Events
      canAUpright: {
        type: Expr.Type.Event,
        eventId: 'canAUpright',
      },
      canBUpright: {
        type: Expr.Type.Event,
        eventId: 'canBUpright',
      },
      canCUpright: {
        type: Expr.Type.Event,
        eventId: 'canCUpright',
      },
      canDUpright: {
        type: Expr.Type.Event,
        eventId: 'canDUpright',
      },
      canEUpright: {
        type: Expr.Type.Event,
        eventId: 'canEUpright',
      },
      allCansUpright: {
        type: Expr.Type.And,
        argIds: ['canAUpright', 'canBUpright', 'canCUpright', 'canDUpright', 'canEUpright'],
      },

      // Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: ['inStartBoxOnce', 'allBasesCovered', 'allCansUpright'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc9',
} as Challenge;
