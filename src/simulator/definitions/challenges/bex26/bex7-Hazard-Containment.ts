import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
  name: tr('Botball Explorer Mission 7'),
  description: tr('Botball Explorer Mission 7: Hazard Containment'),
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
    blueAndOrangePomsInPVC: {
      name: tr('Blue and Orange Poms in PVC'),
      description: tr('Blue and Orange Poms in PVC'),
    },
    blueAndOrangePomsInDifferentPVC: {
      name: tr('Blue and Orange Poms in Different PVC'),
      description: tr('Blue and Orange Poms in Different PVC'),
    },
  },
  success: {
    exprs: {
      blueAndOrangePomsInPVC: {
        type: Expr.Type.Event,
        eventId: 'blueAndOrangePomsInPVC',
      },
      blueAndOrangePomsInDifferentPVC: {
        type: Expr.Type.Event,
        eventId: 'blueAndOrangePomsInDifferentPVC',
      },
      completion: {
        type: Expr.Type.And,
        argIds: ['blueAndOrangePomsInPVC', 'blueAndOrangePomsInDifferentPVC'],
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
      exprId: 'blueAndOrangePomsInPVC',
      name: tr('One Blue and one Orange Poms in PVC'),
    },
    {
      exprId: 'blueAndOrangePomsInDifferentPVC',
      name: tr('Bonus: One Blue and one Orange Poms in Different PVC'),
    }
  ],
  failureGoals: [

  ],
  sceneId: 'bex7'

} as Challenge;