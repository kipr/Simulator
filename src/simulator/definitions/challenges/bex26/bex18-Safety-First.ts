import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 18'),
  description: tr('Botball Explorer Mission 18: Safety First, All Hands on Deck'),
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
    botguyInLoadingZone: {
      name: tr('Botguy in Loading Zone'),
      description: tr('Botguy is in the Loading Zone')
    },
    bonus: {
      name: tr('Bonus'),
      description: tr('Bonus: Botguy is in AND at least one Traffic Cone FULLY WITHIN the Loading Zone')
    },
    advancedBonus: {
      name: tr('Advanced Bonus'),
      description: tr('Advanced Bonus: Botguy is in AND both Traffic Cones FULLY WITHIN the Loading Zone')
    },
  },
  success: {
    exprs: {
      allObjectsOffBlackLine: {
        type: Expr.Type.Event,
        eventId: 'allObjectsOffBlackLine',
      },
      botguyInLoadingZone: {
        type: Expr.Type.Event,
        eventId: 'botguyInLoadingZone',
      },
      bonus: {
        type: Expr.Type.Event,
        eventId: 'bonus',
      },
      advancedBonus: {
        type: Expr.Type.Event,
        eventId: 'advancedBonus',
      },
      completion: {
        type: Expr.Type.And,
        argIds: ['botguyInLoadingZone'],
      }
    },
    rootId: 'completion',
  },
  failure: {
    exprs: {

    },
    rootId: 'failure',
  },
  successGoals: [
    {
      exprId: 'botguyInLoadingZone',
      name: tr('Botguy in Loading Zone'),
    },
    {
      exprId: 'bonus',
      name: tr('Bonus: Botguy is in AND at least one Traffic Cone FULLY WITHIN the Loading Zone'),
    },
    {
      exprId: 'advancedBonus',
      name: tr('Advanced Bonus: Botguy is in AND both Traffic Cones FULLY WITHIN the Loading Zone'),
    },

  ],
  failureGoals: [

  ],
  sceneId: 'bex18'

} as Challenge;