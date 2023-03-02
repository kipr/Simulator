import Author from '../db/Author';
import Challenge from '../state/State/Challenge';
import Expr from '../state/State/Challenge/Expr';
import LocalizedString from '../util/LocalizedString';

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 22' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 22: Stackerz`,
  },
  author: {
    type: Author.Type.Organization,
    id: 'kipr',
    //COMME
  },
  code: {
    c: `#include <kipr/botball.h>`,
    cpp: `#include <kipr/botball.h>`,
    python: `from kipr import botball`,
  },
  defaultLanguage: 'c',
  events: {

   
    leaveStartBox: {
      name: { [LocalizedString.EN_US]: 'Robot Left Start' },
      description: { [LocalizedString.EN_US]: 'Robot left starting box' },
    },

    canStacked: {
      name: { [LocalizedString.EN_US]: 'One Can Stacked' },
      description: { [LocalizedString.EN_US]: 'One can is stacked on another' },
    },
 
    robotTouchCan: {
      name: { [LocalizedString.EN_US]: 'Robot Touching Can' },
      description: { [LocalizedString.EN_US]: 'Robot is touching a can' },
    },

  },
  success: {
    exprs: {


      //Startbox Events
      leaveStartBox: {
        type: Expr.Type.Event,
        eventId: 'leaveStartBox',
      },
      leaveStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'leaveStartBox',
      },

      //Can Events
      canStacked: {
        type: Expr.Type.Event,
        eventId: 'canStacked',
      },
      robotTouchCan: {
        type: Expr.Type.Event,
        eventId: 'robotTouchCan',
      },
      robotTouchCanNot: {
        type: Expr.Type.Not,
        argId: 'robotTouchCan',
      },

   
      completion: {
        type: Expr.Type.And,
        argIds: ['leaveStartBoxOnce', 'canStacked', 'robotTouchCanNot'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc22',
} as Challenge;
