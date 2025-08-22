import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import { on } from 'form-data';
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 23'),
  description: tr(`Junior Botball Challenge 23: Find the Black Line`),
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
    stopAtBlackLine: {
      name: tr("Robot Stops at Black Line"),
      description: tr("Robot stops at black line"),
    },
    onCircle: {
      name: tr("Robot Over Circle"),
      description: tr("Robot over selected circle"),
    },
  },
  success: {
    exprs: {
      onCircle: {
        type: Expr.Type.Event,
        eventId: "onCircle",
      },
      onCircleOnce: {
        type: Expr.Type.Once,
        argId: "onCircle",
      },
      stopAtBlackLine: {
        type: Expr.Type.Event,
        eventId: 'stopAtBlackLine',
      },

      completion: {
        type: Expr.Type.And,
        argIds: [
          'onCircleOnce',
          'stopAtBlackLine',
        ],
      },
    },
    rootId: 'completion',
  },
  successGoals: [
    { exprId: 'onCircleOnce', name: tr('Started over the circle') },
    { exprId: 'stopAtBlackLine', name: tr('Stop at the black line') },
  ],
  sceneId: 'jbc23',
} as Challenge;
