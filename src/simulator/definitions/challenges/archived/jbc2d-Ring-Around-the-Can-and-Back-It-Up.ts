import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';

export default {
  name: tr('JBC Challenge 2D'),
  description: tr(`Junior Botball Challenge 2C: Ring Around the Can and Back It Up`),
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
    can6Intersects: {
      name: tr('Can 6 Intersects'),
      description: tr('Can 6 intersects circle 6'),
    },

    can6Upright: {
      name: tr('Can 6 Upright'),
      description: tr('Can 6 upright on circle 6'),
    },

    returnStartBox1: {
      name: tr('Robot Rentered Start 1'),
      description: tr('Robot reentered starting box after going forwards'),
    },

    returnStartBox2: {
      name: tr('Robot Rentered Start 2'),
      description: tr('Robot reentered starting box after going backwards'),
    },

    driveBackwards: {
      name: tr('Robot Driving Backwards'),
      description: tr('Robot is driving backwards'),
    },
    driveForwards: {
      name: tr('Robot Driving Forwards'),
      description: tr('Robot is driving forwards'),
    },

    rightSide: {
      name: tr('Robot Passed Right Side'),
      description: tr('Robot passed right side of can 6'),
    },

    topSide: {
      name: tr('Robot Passed Top Side'),
      description: tr('Robot passed top side of can 6'),
    },

    leftSide: {
      name: tr('Robot Passed left Side'),
      description: tr('Robot passed left side of can 6'),
    },
  },
  success: {
    exprs: {
      // Driving Backwards events
      driveBackwards: {
        type: Expr.Type.Event,
        eventId: 'driveBackwards',
      },
      driveBackwardsOnce: {
        type: Expr.Type.Once,
        argId: 'driveBackwards',
      },
      driveForwards: {
        type: Expr.Type.Event,
        eventId: 'driveForwards',
      },
      driveForwardsOnce: {
        type: Expr.Type.Once,
        argId: 'driveForwards',
      },
      driving: {
        type: Expr.Type.And,
        argIds: ['driveForwardsOnce', 'driveBackwardsOnce'],
      },

      // Passing side events
      rightSide: {
        type: Expr.Type.Event,
        eventId: 'rightSide',
      },
      rightSideOnce: {
        type: Expr.Type.Once,
        argId: 'rightSide',
      },
      topSide: {
        type: Expr.Type.Event,
        eventId: 'topSide',
      },
      topSideOnce: {
        type: Expr.Type.Once,
        argId: 'topSide',
      },
      leftSide: {
        type: Expr.Type.Event,
        eventId: 'leftSide',
      },
      leftSideOnce: {
        type: Expr.Type.Once,
        argId: 'leftSide',
      },

      // Intersects Events
      can6Intersects: {
        type: Expr.Type.Event,
        eventId: 'can6Intersects',
      },

      // Upright Events
      can6Upright: {
        type: Expr.Type.Event,
        eventId: 'can6Upright',
      },

      // Start Box Events

      returnStartBox1: {
        type: Expr.Type.Event,
        eventId: 'returnStartBox1',
      },
      returnStartBox1Once: {
        type: Expr.Type.Once,
        argId: 'returnStartBox1',
      },
      returnStartBox2: {
        type: Expr.Type.Event,
        eventId: 'returnStartBox2',
      },
      returnStartBox2Once: {
        type: Expr.Type.Once,
        argId: 'returnStartBox2',
      },

      startingBox: {
        type: Expr.Type.And,
        argIds: ['returnStartBox1Once', 'returnStartBox2Once'],
      },

      // Intersects and upright logic
      IntersectsUpright: {
        type: Expr.Type.And,
        argIds: ['can6Intersects', 'can6Upright'],
      },

      // Success Logic = Can A upright, intersects and touched
      completion: {
        type: Expr.Type.And,
        argIds: [
          'driving',
          'IntersectsUpright',
          'startingBox',
          'rightSideOnce',
          'topSideOnce',
          'leftSideOnce',
        ],
      },
    },
    rootId: 'completion',
  },
  sceneId: 'jbc2d',
} as Challenge;
