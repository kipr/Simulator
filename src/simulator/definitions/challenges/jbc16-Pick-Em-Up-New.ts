import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 16' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 16: Pick 'Em Up`,
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

    leaveStartBox: {
      name: { [LocalizedString.EN_US]: 'Robot Left Start' },
      description: { [LocalizedString.EN_US]: 'Robot left starting box' },
    },

    can2Upright: {
      name: { [LocalizedString.EN_US]: 'Can 2 Upright' },
      description: { [LocalizedString.EN_US]: 'Can 2 upright' },
    },
    can9Upright: {
      name: { [LocalizedString.EN_US]: 'Can 9 Upright' },
      description: { [LocalizedString.EN_US]: 'Can 9 upright' },
    },
    can10Upright: {
      name: { [LocalizedString.EN_US]: 'Can 10 Upright' },
      description: { [LocalizedString.EN_US]: 'Can 10 upright' },
    },

    can2Intersects: {
      name: { [LocalizedString.EN_US]: 'Can 2 Intersects Green Garage' },
      description: { [LocalizedString.EN_US]: 'Can 2 intersects Green Garage' },
    },
    can9Intersects: {
      name: { [LocalizedString.EN_US]: 'Can 9 Intersects Blue Garage' },
      description: { [LocalizedString.EN_US]: 'Can 9 intersects Blue Garage' },
    },
    can9IntersectsPurple: {
      name: { [LocalizedString.EN_US]: 'Can 9 Intersects Purple Garage' },
      description: { [LocalizedString.EN_US]: 'Can 9 intersects Purple Garage' },
    },
    can10Intersects: {
      name: { [LocalizedString.EN_US]: 'Can 10 Intersects Yellow Garage' },
      description: { [LocalizedString.EN_US]: 'Can 10 intersects Yellow Garage' },
    },

  },
  success: {
    exprs: {
      // Start Box Events
      leaveStartBox: {
        type: Expr.Type.Event,
        eventId: 'leaveStartBox',
      },
      leaveStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'leaveStartBox',
      },


      // Upright Events
      can2Upright: {
        type: Expr.Type.Event,
        eventId: 'can2Upright',
      },
      can9Upright: {
        type: Expr.Type.Event,
        eventId: 'can9Upright',
      },
      can10Upright: {
        type: Expr.Type.Event,
        eventId: 'can10Upright',
      },

      // Intersects Events
      can2Intersects: {
        type: Expr.Type.Event,
        eventId: 'can2Intersects',
      },
      can9Intersects: {
        type: Expr.Type.Event,
        eventId: 'can9Intersects',
      },
      can10Intersects: {
        type: Expr.Type.Event,
        eventId: 'can10Intersects',
      },

      // Upright and Intersects logic
      can2UprightAndIntersects: {
        type: Expr.Type.And,
        argIds: ['can2Upright', 'can2Intersects'],
      },
      can9UprightAndIntersects: {
        type: Expr.Type.And,
        argIds: ['can9Upright', 'can9Intersects'],
      },
      can10UprightAndIntersects: {
        type: Expr.Type.And,
        argIds: ['can10Upright', 'can10Intersects'],
      },

      // Final And Logic
      cansUprightAndIntersects: {
        type: Expr.Type.And,
        argIds: ['can2UprightAndIntersects', 'can9UprightAndIntersects', 'can10UprightAndIntersects',],
      },



      // Success logic
      completion: {
        type: Expr.Type.And,
        argIds: ['leaveStartBoxOnce', 'cansUprightAndIntersects'],
      },
    },
    rootId: 'completion',
  },

  sceneId: 'jbc16',
} as Challenge;
