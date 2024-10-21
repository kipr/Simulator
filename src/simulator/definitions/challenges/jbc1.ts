import Author from "../../../db/Author";
import Challenge from "../../../state/State/Challenge";
import Expr from "../../../state/State/Challenge/Expr";
import LocalizedString from "../../../util/LocalizedString";
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 1' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 1: Tag, You're it!` },
  author: {
    type: Author.Type.Organization,
    id: 'kipr'
  },
  code: {
    'c': ProgrammingLanguage.DEFAULT_CODE.c,
    'cpp': ProgrammingLanguage.DEFAULT_CODE.cpp,
    'python': ProgrammingLanguage.DEFAULT_CODE.python,
  },
  defaultLanguage: 'c',
  events: {
    can9Touched: {
      name: { [LocalizedString.EN_US]: 'Can 9 Touched' },
      description: { [LocalizedString.EN_US]: 'Can A touched' },
    },
    
    can9Intersects: {
      name: { [LocalizedString.EN_US]: 'Can 9 Intersects' },
      description: { [LocalizedString.EN_US]: 'Can 9 intersects circle 9' },
    },

    can9Upright: {
      name: { [LocalizedString.EN_US]: 'Can 9 Upright' },
      description: { [LocalizedString.EN_US]: 'Can 9 upright on circle 9' },
    },
    
    leaveStartBox: {
      name: { [LocalizedString.EN_US]: 'Robot Left Start' },
      description: { [LocalizedString.EN_US]: 'Robot left starting box' },
    },
    returnStartBox: {
      name: { [LocalizedString.EN_US]: 'Robot Rentered Start' },
      description: { [LocalizedString.EN_US]: 'Robot reentered starting box' },
    },
  },
  success: {
    exprs: {
      // Touch Events
      can9Touched: {
        type: Expr.Type.Event,
        eventId: 'can9Touched',
      },

      // Intersects Events
      can9Intersects: {
        type: Expr.Type.Event,
        eventId: 'can9Intersects',
      },

      // Upright Events
      can9Upright: {
        type: Expr.Type.Event,
        eventId: 'can9Upright',
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

      returnStartBox: {
        type: Expr.Type.Event,
        eventId: 'returnStartBox',
      },
      returnStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'returnStartBox',
      },



      startingBox:{
        type:Expr.Type.And,
        argIds:['leaveStartBoxOnce', 'returnStartBoxOnce'],
      },

      // Intersects and upright logic
      can9IntersectsUpright: {
        type: Expr.Type.And,
        argIds: ['can9Intersects', 'can9Upright'],
      },

      // Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: ['can9Touched', 'can9IntersectsUpright', 'startingBox'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc1',
} as Challenge;