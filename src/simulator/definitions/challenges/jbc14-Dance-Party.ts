import Author from '../../../db/Author';
import Challenge from '../../../state/State/Challenge';
import Expr from '../../../state/State/Challenge/Expr';
import LocalizedString from '../../../util/LocalizedString';
import ProgrammingLanguage from "../../../programming/compiler/ProgrammingLanguage";

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 14' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 14: Dance Party`,
  },
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
      name: { [LocalizedString.EN_US]: 'Robot not in Start Box' },
      description: { [LocalizedString.EN_US]: 'Robot not in start box' },
    },
    leaveStartBox: {
      name: { [LocalizedString.EN_US]: 'Robot Left Start' },
      description: { [LocalizedString.EN_US]: 'Robot left starting box' },
    },
    clockwise360: {
      name: { [LocalizedString.EN_US]: 'Robot 360 Clockwise' },
      description: { [LocalizedString.EN_US]: 'Robot turned 360 degrees clockwise', },
    },
    counterClockwise360: {
      name: { [LocalizedString.EN_US]: 'Robot 360 Counter Clockwise' },
      description: { [LocalizedString.EN_US]: 'Robot turned 360 degrees counter clockwise', },
    },
    driveForward: {
      name: { [LocalizedString.EN_US]: 'Robot Drove Forward' },
      description: { [LocalizedString.EN_US]: 'Robot drove forward', },
    },
    driveBackward: {
      name: { [LocalizedString.EN_US]: 'Robot Drove Backward' },
      description: { [LocalizedString.EN_US]: 'Robot drove backward', },
    },
    waveServo: {
      name: { [LocalizedString.EN_US]: 'Robot Wave Servo' },
      description: { [LocalizedString.EN_US]: 'Robot waved servo up and down at least once', },
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
    { exprId: 'inStartBoxOnce', name: { [LocalizedString.EN_US]: 'Start in the Start Box' } },
    { exprId: 'leaveStartBoxOnce', name: { [LocalizedString.EN_US]: 'Leave the Start Box' } },
    { exprId: 'clockwise360Once', name: { [LocalizedString.EN_US]: 'Turn 360° clockwise' } },
    { exprId: 'counterClockwise360Once', name: { [LocalizedString.EN_US]: 'Turn 360° counter clockwise' } },
    { exprId: 'driveForwardOnce', name: { [LocalizedString.EN_US]: 'Drive forward' } },
    { exprId: 'driveBackwardOnce', name: { [LocalizedString.EN_US]: 'Drive backward' } },
    { exprId: 'waveServoOnce', name: { [LocalizedString.EN_US]: 'Wave the servo' } },
  ],
  sceneId: 'jbc14',
} as Challenge;
