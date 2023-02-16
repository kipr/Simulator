import Author from '../db/Author';
import Challenge from '../state/State/Challenge';
import Expr from '../state/State/Challenge/Expr';
import LocalizedString from '../util/LocalizedString';

export default {
  name: { [LocalizedString.EN_US]: 'JBC Challenge 5' },
  description: {
    [LocalizedString.EN_US]: `Junior Botball Challenge 5: Dance Party`,
  },
  author: {
    type: Author.Type.Organization,
    id: 'kipr',
    //COMME
  },
  code: {
    c: `#include <kipr/botball.h>`,
    cpp: `#include <kipr/botball.h>`,
    python: `from kipr import botball`,
  },
  defaultLanguage: 'c',
  events: {
    leaveStartBox: {
      name: { [LocalizedString.EN_US]: 'Robot Left Start' },
      description: { [LocalizedString.EN_US]: 'Robot left starting box' },
    },
    clockwise360: {
      name: { [LocalizedString.EN_US]: 'Robot 360 Clockwise' },
      description: {
        [LocalizedString.EN_US]: 'Robot turned 360 degrees clockwise',
      },
    },
    counterClockwise360: {
      name: { [LocalizedString.EN_US]: 'Robot 360 Counter Clockwise' },
      description: {
        [LocalizedString.EN_US]: 'Robot turned 360 degrees counter clockwise',
      },
    },
    driveForward: {
      name: { [LocalizedString.EN_US]: 'Robot Drove Forward' },
      description: {
        [LocalizedString.EN_US]: 'Robot drove forward',
      },
    },
    driveBackward: {
      name: { [LocalizedString.EN_US]: 'Robot Drove Backward' },
      description: {
        [LocalizedString.EN_US]: 'Robot drove backward',
      },
    },
    waveServo: {
      name: { [LocalizedString.EN_US]: 'Robot Wave Servo' },
      description: {
        [LocalizedString.EN_US]: 'Robot waved servo up and down at least once',
      },
    },
  },
  success: {
    exprs: {
      //Waving Event
      waveServo: {
        type: Expr.Type.Event,
        eventId: 'waveServo',
      },
      waveServoOnce: {
        type: Expr.Type.Once,
        argId: 'waveServo',
      },

      //Turning Events
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

      //Start Box Events
      leaveStartBox: {
        type: Expr.Type.Event,
        eventId: 'leaveStartBox',
      },
      leaveStartBoxOnce: {
        type: Expr.Type.Once,
        argId: 'leaveStartBox',
      },

      //Driving Events
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
        argIds: ['leaveStartBoxOnce', 'turning', 'driving', 'waveServoOnce'],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc5',
} as Challenge;
