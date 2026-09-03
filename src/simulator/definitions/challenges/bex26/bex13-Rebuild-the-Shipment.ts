import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 13'),
  description: tr('Botball Explorer Mission 13: Rebuild the Shipment'),
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
    allCubesOffBlackLine: {
      name: tr('All Cubes Off Black Line'),
      description: tr('All cubes are off the black line')
    },
    bonus: {
      name: tr('Bonus'),
      description: tr('Two cubes are stacked on top of each other')
    },
    advancedBonus: {
      name: tr('Advanced Bonus'),
      description: tr('All three cubes are stacked on top of each other')
    }

  },
  success: {
    exprs: {
      allCubesOffBlackLine: {
        type: Expr.Type.Event,
        eventId: 'allCubesOffBlackLine',
      },
      allCubesOffBlackLineOnce: {
        type: Expr.Type.Once,
        argId: 'allCubesOffBlackLine',
      },




      completion: {
        type: Expr.Type.And,
        argIds: ['allCubesOffBlackLineOnce'],
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
      exprId: 'completion',
      name: tr('All Cubes Off Black Line'),
    },
    {
      exprId: 'bonus',
      name: tr('Bonus: Two Cubes Stacked on Top of Each Other'),
    },
    {
      exprId: 'advancedBonus',
      name: tr('Advanced Bonus: All Three Cubes Stacked on Top of Each Other'),
    }

  ],
  failureGoals: [

  ],
  sceneId: 'bex13'

} as Challenge;