import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 8'),
  description: tr('Botball Explorer Mission 8: Deliver the Red Cube'),
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
    largeCubeAndPalletOnLoadingDock: {
      name: tr('Large Red Cube and Pallet on Loading Dock'),
      description: tr('Large Red Cube and Pallet on Loading Dock'),
    },
    bonus: {
      name: tr('Bonus: Small Red Cube on Large Red Cube on Loading Dock'),
      description: tr('Small Red Cube on Large Red Cube on Loading Dock'),
    }


  },
  success: {
    exprs: {
      largeCubeAndPalletOnLoadingDock: {
        type: Expr.Type.Event,
        eventId: 'largeCubeAndPalletOnLoadingDock',
      },
      bonus: {
        type: Expr.Type.Event,
        eventId: 'bonus',
      },
      completion: {
        type: Expr.Type.Event,
        eventId: 'largeCubeAndPalletOnLoadingDock',
      },
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
      exprId: 'largeCubeAndPalletOnLoadingDock',
      name: tr('Large Red Cube and Pallet on Loading Dock'),
    },
    {
      exprId: 'bonus',
      name: tr('Bonus: Small Red Cube on Large Red Cube on Loading Dock'),
    }
  ],
  failureGoals: [

  ],
  sceneId: 'bex8'

} as Challenge;