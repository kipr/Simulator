import Author from '../db/Author';
import Challenge from '../state/State/Challenge';
import Expr from '../state/State/Challenge/Expr';
import LocalizedString from '../util/LocalizedString';

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 1' },
  description: { [LocalizedString.EN_US]: `Junior Botball Challenge 1: Tag, You're it!` },
  author: {
    type: Author.Type.Organization,
    id: 'kipr'
    //COMME
  },
  code: {
    'c': `#include <kipr/botball.h>`,
    'cpp': `#include <kipr/botball.h>`,
    'python': `from kipr import botball`,
  },
  defaultLanguage: 'c',
  events: {
    canATouched: {
      name: { [LocalizedString.EN_US]: 'Can A Touched' },
      description: { [LocalizedString.EN_US]: 'Can A touched' },
    },
    canAIntersects: {
      name: { [LocalizedString.EN_US]: 'Can A Intersects' },
      description: { [LocalizedString.EN_US]: 'Can A intersects circle 9' },
    },

    canAUpright: {
      name: { [LocalizedString.EN_US]: 'Can A Upright' },
      description: { [LocalizedString.EN_US]: 'Can A upright on circle 9' },
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
      canATouched: {
        type: Expr.Type.Event,
        eventId: 'canATouched',
      },
      // Intersects Events
      canAIntersects: {
        type: Expr.Type.Event,
        eventId: 'canAIntersects',
      },

      //Upright Events
      canAUpright: {
        type: Expr.Type.Event,
        eventId: 'canAUpright',
      },

      //Start Box Events
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



      boxStuff:{
        type:Expr.Type.And,
        argIds:['leaveStartBoxOnce', 'returnStartBoxOnce'],
      },

      //Intersects and upright logic
      aIntersectsUpright: {
        type: Expr.Type.And,
        argIds: ['canAIntersects', 'canAUpright'],
      },

      //Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: ['canATouched', 'aIntersectsUpright', 'boxStuff'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc1',
} as Challenge;