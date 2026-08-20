import Author from '../../../../db/Author';
import Challenge from '../../../../state/State/Challenge';
import Expr from '../../../../state/State/Challenge/Expr';
import ProgrammingLanguage from "../../../../programming/compiler/ProgrammingLanguage";
import tr from '@i18n';


export default {
    name: tr('Botball Explorer Mission 2'),
    description: tr('Botball Explorer Mission 2: Relocate the Red Cube'),
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
        inStartBox: {
            name: tr('In Start Box'),
            description: tr('Robot is in the start box'),
        },
        notInStartBox: {
            name: tr('Not In Start Box'),
            description: tr('Robot is not in the start box'),
        },
        reachedEnd: {
            name: tr('Robot Reached End'),
            description: tr('Robot reached the end of the mat'),
        },
        noStop: {
            name: tr('Robot Did Not Stop'),
            description: tr('Robot did not stop in the adjacent zone'),
        },
        returnToStartBox: {
            name: tr('Robot Returned to Start Box'),
            description: tr('Robot returned to the start box'),
        },
    },
    success: {
        exprs: {

            // End of Mat Events
            reachedEnd: {
                type: Expr.Type.Event,
                eventId: 'reachedEnd',
            },
            reachedEndOnce: {
                type: Expr.Type.Once,
                argId: 'reachedEnd',
            },

            // Start Box Events

            notInStartBox: {
                type: Expr.Type.Event,
                eventId: 'notInStartBox',
            },
            inStartBox: {
                type: Expr.Type.Not,
                argId: 'notInStartBox',
            },
            inStartBoxOnce: {
                type: Expr.Type.Once,
                argId: "inStartBox",
            },

            notOutOfStartBox: {
                type: Expr.Type.Not,
                argId: 'notInStartBox',
            },
            startedInStartBox: {
                type: Expr.Type.And,
                argIds: ['inStartBox', 'notOutOfStartBox'],
            },
            startedInStartBoxOnce: {
                type: Expr.Type.Once,
                argId: 'startedInStartBox',
            },
            returnToStartBox: {
                type: Expr.Type.Event,
                eventId: 'returnToStartBox'
            },
            returnToStartBoxOnce: {
                type: Expr.Type.Once,
                argId: 'returnToStartBox'
            },
            bonusReturn: {
                type: Expr.Type.And,
                argIds: ['startedInStartBoxOnce', 'reachedEndOnce', 'returnToStartBoxOnce'],
            },
            completion: {
                type: Expr.Type.And,
                argIds: ['startedInStartBoxOnce', 'reachedEndOnce'],
            },
        },
        rootId: 'completion',
    },
    failure: {
        exprs: {
            noStop: {
                type: Expr.Type.Event,
                eventId: 'noStop',
            },
            noStopOnce: {
                type: Expr.Type.Once,
                argId: 'noStop',
            },

            failure: {
                type: Expr.Type.And,
                argIds: ['noStopOnce'],
            }
        },
        rootId: 'failure',
    },
    successGoals: [
        {
            exprId: 'startedInStartBoxOnce',
            name: tr('Start in the Start Box'),
        },
        {
            exprId: 'reachedEndOnce',
            name: tr('Reach the end other zone'),
        },
        {
            exprId: 'returnToStartBoxOnce',
            name: tr('Bonus: Return to starting box'),

        }
    ],
    failureGoals: [
        {
            exprId: 'noStop',
            name: tr('Did not stop in the adjacent zone'),
        }
    ],
    sceneId: 'bex2'

} as Challenge;