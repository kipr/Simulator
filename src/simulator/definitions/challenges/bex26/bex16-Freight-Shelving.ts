import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 16'),
  description: tr('Botball Explorer Mission 16: Freight Shelving'),
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
    oneCubeOnLargeGreenCube: {
      name: tr('One Cube on Large Green Cube'),
      description: tr('One cube is on top of the large green cube')
    },

    bonus: {
      name: tr('Bonus'),
      description: tr('Two or more cubes are on top of the large green cube')
    }
  },
  success: {
    exprs: {
      oneCubeOnLargeGreenCube: {
        type: Expr.Type.Event,
        eventId: 'oneCubeOnLargeGreenCube',
      },
      bonus: {
        type: Expr.Type.Event,
        eventId: 'bonus',
      },
      completion: {
        type: Expr.Type.And,
        argIds: ['oneCubeOnLargeGreenCube'],
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
      exprId: 'oneCubeOnLargeGreenCube',
      name: tr('One Cube on Large Green Cube'),
    },
    {
      exprId: 'bonus',
      name: tr('Two or More Cubes on Large Green Cube'),
    }
  ],
  failureGoals: [

  ],
  sceneId: 'bex16'

} as Challenge;