import { AccountAuthorizations } from "state/State";
import store from '..';
import construct from '../../util/construct';
import AccountAuthorization, { AsyncAccountAuthorization } from "state/State/AccountAuthorization";
import Async from "../State/Async";
import db from '../../db';
import Selector from '../../db/Selector';
import { errorToAsyncError } from "./util";





export namespace AccountAuthorizationsAction {

    export interface LoadAccountAuthorization {
        type: 'account-authorizations/load-account-authorization';
        userId: string;
    }

    export const loadAccountAuthorization = construct<LoadAccountAuthorization>('account-authorizations/load-account-authorization');

    export interface CreateAccountAuthorization {
        type: 'account-authorizations/create-account-authorization';
        challengeId: string;
        accountAuthorization: AccountAuthorization;
    }

    export const createAccountAuthorization = construct<CreateAccountAuthorization>('account-authorizations/create-account-authorization');

    export interface SetAccountAuthorizationInternal {
        type: 'account-authorizations/set-account-authorization-internal';
        userId: string;
        accountAuthorization: AsyncAccountAuthorization;
    }

    export const setAccountAuthorizationInternal = construct<SetAccountAuthorizationInternal>('account-authorizations/set-account-authorization-internal');


}


export type AccountAuthorizationsAction = (
    AccountAuthorizationsAction.CreateAccountAuthorization |
    AccountAuthorizationsAction.SetAccountAuthorizationInternal

);

const create = async (userId: string, next: Async.Creating<AccountAuthorization>) => {
    try {
        await db.set(Selector.accountAuthorization(userId), next.value);
        store.dispatch(AccountAuthorizationsAction.setAccountAuthorizationInternal({
            accountAuthorization: Async.loaded({
                brief: {},
                value: next.value
            }),
            userId,
        }));
    } catch (error) {
        store.dispatch(AccountAuthorizationsAction.setAccountAuthorizationInternal({
            accountAuthorization: Async.createFailed({
                value: next.value,
                error: errorToAsyncError(error),
            }),
            userId,
        }));
    }
};


const DEFAULT_ACCOUNT_AUTHORIZATION: AccountAuthorizations = {
};



export const reduceAccountAuthorizations = (state: AccountAuthorizations = DEFAULT_ACCOUNT_AUTHORIZATION, action: AccountAuthorizationsAction): AccountAuthorizations => {
    switch (action.type) {

        case 'account-authorizations/create-account-authorization': {
            const creating = Async.creating({ value: action.accountAuthorization });
            void create(action.challengeId, creating);
            return {
                ...state,
                [action.challengeId]: creating,
            };
        }
        case 'account-authorizations/set-account-authorization-internal': return {
            ...state,
            [action.challengeId]: action.accountAuthorization,
        };

        default: return state;
    }
};