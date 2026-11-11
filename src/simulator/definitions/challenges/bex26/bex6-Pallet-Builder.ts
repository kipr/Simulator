import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 6'),
  description: tr('Botball Explorer Mission 6: Pallet Builder'),
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
    topGreenCubeOnPallet: {
      name: tr('Top Green Cube on Pallet'),
      description: tr('Top Green Cube stacked on Pallet'),
    },
    topYellowCubeOnPallet: {
      name: tr('Top Yellow Cube on Pallet'),
      description: tr('Top Yellow Cube stacked on Pallet'),
    },
    bottomGreenCubeOnPallet: {
      name: tr('Bottom Green Cube on Pallet'),
      description: tr('Bottom Green Cube stacked on Pallet'),
    },
    bottomYellowCubeOnPallet: {
      name: tr('Bottom Yellow Cube on Pallet'),
      description: tr('Bottom Yellow Cube stacked on Pallet'),
    },
    bonus: {
      name: tr('Bonus: Pallet fully within Start Box A or Start Box B'),
      description: tr('Pallet fully within Start Box A or Start Box B'),
    }
  },
  success: {
    exprs: {

      topGreenCubeOnPallet: {
        type: Expr.Type.Event,
        eventId: 'topGreenCubeOnPallet',
      },
      topYellowCubeOnPallet: {
        type: Expr.Type.Event,
        eventId: 'topYellowCubeOnPallet',
      },
      bottomGreenCubeOnPallet: {
        type: Expr.Type.Event,
        eventId: 'bottomGreenCubeOnPallet',
      },
      bottomYellowCubeOnPallet: {
        type: Expr.Type.Event,
        eventId: 'bottomYellowCubeOnPallet',
      },
      bonus: {
        type: Expr.Type.Event,
        eventId: 'bonus',
      },
      completion: {
        type: Expr.Type.And,
        argIds: [
          'topGreenCubeOnPallet',
          'topYellowCubeOnPallet',
          'bottomGreenCubeOnPallet',
          'bottomYellowCubeOnPallet'
        ],
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
      exprId: 'topGreenCubeOnPallet',
      name: tr('Top Green Cube stacked on Pallet'),
    },
    {
      exprId: 'topYellowCubeOnPallet',
      name: tr('Top Yellow Cube stacked on Pallet'),
    },
    {
      exprId: 'bottomGreenCubeOnPallet',
      name: tr('Bottom Green Cube stacked on Pallet'),
    },
    {
      exprId: 'bottomYellowCubeOnPallet',
      name: tr('Bottom Yellow Cube stacked on Pallet'),
    },
    {
      exprId: 'bonus',
      name: tr('Bonus: Pallet fully within Start Box A or Start Box B'),
    }
  ],
  failureGoals: [

  ],
  sceneId: 'bex6'

} as Challenge;