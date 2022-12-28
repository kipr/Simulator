import Author from '../db/Author';
import Challenge from '../state/State/Challenge';
import Expr from '../state/State/Challenge/Expr';
import LocalizedString from '../util/LocalizedString';

export default {
  name: { [LocalizedString.EN_US]: 'Test' },
  description: { [LocalizedString.EN_US]: 'Test' },
  author: {
    type: Author.Type.Organization,
    id: 'kipr'
  },
  events: {
    a: {
      name: { [LocalizedString.EN_US]: 'A' },
      description: { [LocalizedString.EN_US]: 'A' },
    },
    b: {
      name: { [LocalizedString.EN_US]: 'B' },
      description: { [LocalizedString.EN_US]: 'B' },
    }
  },
  success: {
    exprs: {
      a: {
        type: Expr.Type.Event,
        eventId: 'a',
      }
    },
    rootId: 'a',
  },
  failure: {
    exprs: {
      b: {
        type: Expr.Type.Event,
        eventId: 'b',
      }
    },
    rootId: 'b',
  },
  sceneId: 'jbcSandboxA',
} as Challenge;