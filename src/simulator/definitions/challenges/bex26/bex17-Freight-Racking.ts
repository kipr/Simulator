import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 17'),
  description: tr('Botball Explorer Mission 17: Freight Racking'),
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
    oneCubeOnLargeBrownCube: {
      name: tr('One Cube on Large Brown Cube'),
      description: tr('One cube is on top of the large brown cube')
    },

    bonus: {
      name: tr('Bonus'),
      description: tr('Two or more cubes are on top of the large brown cube')
    }
  },
  success: {
    exprs: {
      oneCubeOnLargeBrownCube: {
        type: Expr.Type.Event,
        eventId: 'oneCubeOnLargeBrownCube',
      },
      bonus: {
        type: Expr.Type.Event,
        eventId: 'bonus',
      },
      completion: {
        type: Expr.Type.And,
        argIds: ['oneCubeOnLargeBrownCube'],
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
      exprId: 'oneCubeOnLargeBrownCube',
      name: tr('One Cube on Large Brown Cube'),
    },
    {
      exprId: 'bonus',
      name: tr('Two or More Cubes on Large Brown Cube'),
    }
  ],
  failureGoals: [

  ],
  sceneId: 'bex17'

} as Challenge;