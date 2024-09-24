import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 7B' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 7B: Cover Your Bases`,
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
    robotNoTouchFirst: {
      name: { [LocalizedString.EN_US]: "Robot Doesn't Touch " },
      description: {
        [LocalizedString.EN_US]: "Robot doesn't touch a can at the start",
      },
    },
    canAIntersects: {
      name: { [LocalizedString.EN_US]: 'Can A Intersects' },
      description: { [LocalizedString.EN_US]: 'Can A in a circle' },
    },
    canBIntersects: {
      name: { [LocalizedString.EN_US]: 'Can B Intersects' },
      description: { [LocalizedString.EN_US]: 'Can B in a circle' },
    },
    canCIntersects: {
      name: { [LocalizedString.EN_US]: 'Can C Intersects' },
      description: { [LocalizedString.EN_US]: 'Can C in a circle' },
    },
    canDIntersects: {
      name: { [LocalizedString.EN_US]: 'Can D Intersects' },
      description: { [LocalizedString.EN_US]: 'Can D in a circle' },
    },
    canEIntersects: {
      name: { [LocalizedString.EN_US]: 'Can E Intersects' },
      description: { [LocalizedString.EN_US]: 'Can E in a circle' },
    },

    canAUpright: {
      name: { [LocalizedString.EN_US]: 'Can A Upright' },
      description: {
        [LocalizedString.EN_US]: 'Can A upright in a circle',
      },
    },
    canBUpright: {
      name: { [LocalizedString.EN_US]: 'Can B Upright' },
      description: {
        [LocalizedString.EN_US]: 'Can B upright in a circle',
      },
    },
    canCUpright: {
      name: { [LocalizedString.EN_US]: 'Can C Upright' },
      description: {
        [LocalizedString.EN_US]: 'Can C upright in a circle',
      },
    },
    canDUpright: {
      name: { [LocalizedString.EN_US]: 'Can D Upright' },
      description: {
        [LocalizedString.EN_US]: 'Can D upright in a circle',
      },
    },
    canEUpright: {
      name: { [LocalizedString.EN_US]: 'Can E Upright' },
      description: {
        [LocalizedString.EN_US]: 'Can E upright in a circle',
      },
    },

    leaveStartBox: {
      name: { [LocalizedString.EN_US]: 'Robot Left Start' },
      description: { [LocalizedString.EN_US]: 'Robot left starting box' },
    },

  },
  success: {
    exprs: {
      // Touch Events
      robotNoTouchFirst: {
        type: Expr.Type.Event,
        eventId: 'robotNoTouchFirst',
      },
      robotNoTouchFirstOnce: {
        type: Expr.Type.Once,
        argId: 'robotNoTouchFirst',
      },
      robotNoTouchFirstOnceNot: {
        type: Expr.Type.Not,
        argId: 'robotNoTouchFirstOnce',
      },

      // Intersects Events
      canAIntersects: {
        type: Expr.Type.Event,
        eventId: 'canAIntersects',
      },
      canBIntersects: {
        type: Expr.Type.Event,
        eventId: 'canBIntersects',
      },
      canCIntersects: {
        type: Expr.Type.Event,
        eventId: 'canCIntersects',
      },
      canDIntersects: {
        type: Expr.Type.Event,
        eventId: 'canDIntersects',
      },
      canEIntersects: {
        type: Expr.Type.Event,
        eventId: 'canEIntersects',
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

      // Start Box Events
      leaveStartBox: {
        type: Expr.Type.Event,
        eventId: 'leaveStartBox',
      },
      leaveStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'leaveStartBox',
      },
      startingBox: {
        type: Expr.Type.And,
        argIds: ['leaveStartBoxOnce'],
      },

      // Intersects and upright logic
      IntersectsUprightA: {
        type: Expr.Type.And,
        argIds: ['canAIntersects', 'canAUpright'],
      },
      IntersectsUprightB: {
        type: Expr.Type.And,
        argIds: ['canBIntersects', 'canBUpright'],
      },
      IntersectsUprightC: {
        type: Expr.Type.And,
        argIds: ['canCIntersects', 'canCUpright'],
      },
      IntersectsUprightD: {
        type: Expr.Type.And,
        argIds: ['canDIntersects', 'canDUpright'],
      },
      IntersectsUprightE: {
        type: Expr.Type.And,
        argIds: ['canEIntersects', 'canEUpright'],
      },
      AllIntersectsUpright: {
        type: Expr.Type.And,
        argIds: [
          'IntersectsUprightA',
          'IntersectsUprightB',
          'IntersectsUprightC',
          'IntersectsUprightD',
          'IntersectsUprightE',
        ],
      },

      // Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: ['robotNoTouchFirstOnceNot','startingBox', 'AllIntersectsUpright'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc7b',
} as Challenge;
