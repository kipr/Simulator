import Author from '../db/Author';
import Challenge from '../state/State/Challenge';
import Expr from '../state/State/Challenge/Expr';
import LocalizedString from '../util/LocalizedString';

export default {
    name: { [LocalizedString.EN_US]: 'JBC Challenge 6C' },
    description: { [LocalizedString.EN_US]: 'Junior Botball Challenge 6C: Empty the Garage' },
    author: {
        type: Author.Type.Organization,
        id: 'kipr'
    },
    code: {
        'c': `#include <kipr/botball.h>`,
        'cpp': `#include <kipr/botball.h>`,
        'python': `from kipr import botball`,
    },
    defaultLanguage: 'c',
    events: {
        canALifted: {
            name: { [LocalizedString.EN_US]: 'Can A Lifted' },
            description: { [LocalizedString.EN_US]: 'Can A picked up' },
        },
        canBLifted: {
            name: { [LocalizedString.EN_US]: 'Can A Lifted' },
            description: { [LocalizedString.EN_US]: 'Can A picked up' },
        },
        canCLifted: {
            name: { [LocalizedString.EN_US]: 'Can A Lifted' },
            description: { [LocalizedString.EN_US]: 'Can A picked up' },
        },
        canAPlaced: {
            name: { [LocalizedString.EN_US]: 'Can A Placed' },
            description: { [LocalizedString.EN_US]: 'Can A placed on circle 2' },
        },
        canBPlaced: {
            name: { [LocalizedString.EN_US]: 'Can B Placed' },
            description: { [LocalizedString.EN_US]: 'Can A placed on circle 9' },
        },
        canCPlaced: {
            name: { [LocalizedString.EN_US]: 'Can C Placed' },
            description: { [LocalizedString.EN_US]: 'Can A placed on circle 10' },
        },
        canAUpright: {
            name: { [LocalizedString.EN_US]: 'Can A Upright' },
            description: { [LocalizedString.EN_US]: 'Can A upright on circle 2' },
        },
        canBUpright: {
            name: { [LocalizedString.EN_US]: 'Can B Upright' },
            description: { [LocalizedString.EN_US]: 'Can B upright on circle 9' },
        },
        canCUpright: {
            name: { [LocalizedString.EN_US]: 'Can C Upright' },
            description: { [LocalizedString.EN_US]: 'Can C upright on circle 10' },
        },
    },
    success: {
        exprs: {
            // Lift events
            canALifted: {
                type: Expr.Type.Event,
                eventId: 'canALifted',
            },
            canBLifted: {
                type: Expr.Type.Event,
                eventId: 'canBLifted',
            },
            canCLifted: {
                type: Expr.Type.Event,
                eventId: 'canCLifted',
            },
            // Lift once Logic
            aLiftedOnce: {
                type: Expr.Type.Once,
                argId: 'canALifted',
            },
            bLiftedOnce: {
                type: Expr.Type.Once,
                argId: 'canBLifted',
            },
            cLiftedOnce: {
                type: Expr.Type.Once,
                argId: 'canCLifted',
            },
            // At least two cans lifted logic
            abLifted: {
                type: Expr.Type.And,
                argIds: ['aLiftedOnce', 'bLiftedOnce'],
            },
            acLifted: {
                type: Expr.Type.And,
                argIds: ['aLiftedOnce', 'cLiftedOnce'],
            },
            bcLifted: {
                type: Expr.Type.And,
                argIds: ['bLiftedOnce', 'cLiftedOnce'],
            },
            abcLifted: {
                type: Expr.Type.Or,
                argIds: ['abLifted', 'acLifted', 'bcLifted'],
            },
            // Place events
            canAPlaced: {
                type: Expr.Type.Event,
                eventId: 'canAPlaced',
            },
            canBPlaced: {
                type: Expr.Type.Event,
                eventId: 'canBPlaced',
            },
            canCPlaced: {
                type: Expr.Type.Event,
                eventId: 'canCPlaced',
            },
            // Upright events
            canAUpright: {
                type: Expr.Type.Event,
                eventId: 'canAUpright',
            },
            canBUpright: {
                type: Expr.Type.Event,
                eventId: 'canBUpright',
            },
            canCUpright: {
                type: Expr.Type.Event,
                eventId: 'canCUpright',
            },
            // Placed upright logic
            aPlacedUpright: {
                type: Expr.Type.And,
                argIds: ['canAPlaced', 'canAUpright'],
            },
            bPlacedUpright: {
                type: Expr.Type.And,
                argIds: ['canBPlaced', 'canBUpright'],
            },
            cPlacedUpright: {
                type: Expr.Type.And,
                argIds: ['canCPlaced', 'canCUpright'],
            },
            // At least two cans placed upright logic
            abPlacedUpright: {
                type: Expr.Type.And,
                argIds: ['aPlacedUpright', 'bPlacedUpright'],
            },
            acPlacedUpright: {
                type: Expr.Type.And,
                argIds: ['aPlacedUpright', 'cPlacedUpright'],
            },
            bcPlacedUpright: {
                type: Expr.Type.And,
                argIds: ['bPlacedUpright', 'cPlacedUpright'],
            },
            abcPlacedUpright: {
                type: Expr.Type.Or,
                argIds: ['abPlacedUpright', 'acPlacedUpright', 'bcPlacedUpright'],
            },
            // Success logic
            completion: {
                type: Expr.Type.And,
                argIds: ['abcLifted', 'abcPlacedUpright'],
            },
        },
        rootId: 'success',
    },
    failure: {
        exprs: {
            // Test for failure
        },
        rootId: 'failure',
    },
    sceneId: 'jbc6c',
} as Challenge;