import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 14'),
  description: tr(`Junior Botball Challenge 14: Dance Party`),
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
    notInStartBox: {
      name: tr('Robot not in Start Box'),
      description: tr('Robot not in start box'),
    },
    leaveStartBox: {
      name: tr('Robot Left Start'),
      description: tr('Robot left starting box'),
    },
    clockwise360: {
      name: tr('Robot 360 Clockwise'),
      description: tr('Robot turned 360 degrees clockwise'),
    },
    counterClockwise360: {
      name: tr('Robot 360 Counter Clockwise'),
      description: tr('Robot turned 360 degrees counter clockwise'),
    },
    driveForward: {
      name: tr('Robot Drove Forward'),
      description: tr('Robot drove forward'),
    },
    driveBackward: {
      name: tr('Robot Drove Backward'),
      description: tr('Robot drove backward'),
    },
    waveServo: {
      name: tr('Robot Wave Servo'),
      description: tr('Robot waved servo up and down at least once'),
    },
  },
  success: {
    exprs: {
      // Waving Event
      waveServo: {
        type: Expr.Type.Event,
        eventId: 'waveServo',
      },
      waveServoOnce: {
        type: Expr.Type.Once,
        argId: 'waveServo',
      },

      // Turning Events
      clockwise360: {
        type: Expr.Type.Event,
        eventId: 'clockwise360',
      },
      clockwise360Once: {
        type: Expr.Type.Once,
        argId: 'clockwise360',
      },
      counterClockwise360: {
        type: Expr.Type.Event,
        eventId: 'counterClockwise360',
      },
      counterClockwise360Once: {
        type: Expr.Type.Once,
        argId: 'counterClockwise360',
      },
      turning: {
        type: Expr.Type.And,
        argIds: ['clockwise360Once', 'counterClockwise360Once'],
      },

      // Start Box Events
      notInStartBox: {
        type: Expr.Type.Event,
        eventId: 'notInStartBox',
      },
      inStartBox: {
        type: Expr.Type.Not,
        argId: "notInStartBox",
      },
      inStartBoxOnce: {
        type: Expr.Type.Once,
        argId: "inStartBox",
      },
      leaveStartBox: {
        type: Expr.Type.Event,
        eventId: 'leaveStartBox',
      },
      leaveStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'leaveStartBox',
      },

      // Driving Events
      driveForward: {
        type: Expr.Type.Event,
        eventId: 'driveForward',
      },
      driveForwardOnce: {
        type: Expr.Type.Once,
        argId: 'driveForward',
      },
      driveBackward: {
        type: Expr.Type.Event,
        eventId: 'driveBackward',
      },
      driveBackwardOnce: {
        type: Expr.Type.Once,
        argId: 'driveBackward',
      },

      driving: {
        type: Expr.Type.And,
        argIds: ['driveForwardOnce', 'driveBackwardOnce'],
      },

      completion: {
        type: Expr.Type.And,
        argIds: ['inStartBoxOnce', 'leaveStartBoxOnce', 'turning', 'driving', 'waveServoOnce'],
      },
    },
    rootId: 'completion',
  },
  successGoals: [
    { exprId: 'inStartBoxOnce', name: tr('Start in the Start Box') },
    { exprId: 'leaveStartBoxOnce', name: tr('Leave the Start Box') },
    { exprId: 'clockwise360Once', name: tr('Turn 360° clockwise') },
    { exprId: 'counterClockwise360Once', name: tr('Turn 360° counter clockwise') },
    { exprId: 'driveForwardOnce', name: tr('Drive forward') },
    { exprId: 'driveBackwardOnce', name: tr('Drive backward') },
    { exprId: 'waveServoOnce', name: tr('Wave the servo') },
  ],
  sceneId: 'jbc14',
} as Challenge;
