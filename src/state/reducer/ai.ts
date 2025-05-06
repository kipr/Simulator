import * as Ai from '../State/Ai';
import { Size } from '../../components/interface/Widget';
import construct from '../../util/redux/construct';
import { v4 as uuidv4 } from 'uuid';
import { AiState, DEFAULT } from '../State/Ai';

/**
 * Action types for Ai
 */
export namespace AiAction {
    export interface SetVisible {
        type: 'ai/set-visible';
        visible: boolean;
    }

    export const setVisible = construct<SetVisible>('ai/set-visible');

    export interface SetSize {
        type: 'ai/set-size';
        size: Size;
    }

    export const setSize = construct<SetSize>('ai/set-size');

    export interface AddUserMessage {
        type: 'ai/add-user-message';
        content: string;
    }

    export const addUserMessage = construct<AddUserMessage>('ai/add-user-message');

    export interface AddAssistantMessage {
        type: 'ai/add-assistant-message';
        content: string;
    }

    export const addAssistantMessage = construct<AddAssistantMessage>('ai/add-assistant-message');

    export interface SetLoading {
        type: 'ai/set-loading';
        loading: boolean;
    }

    export const setLoading = construct<SetLoading>('ai/set-loading');

    export interface SetError {
        type: 'ai/set-error';
        error: string;
    }

    export const setError = construct<SetError>('ai/set-error');

    export interface ClearError {
        type: 'ai/clear-error';
    }

    export const CLEAR_ERROR: ClearError = { type: 'ai/clear-error' };

    export interface ClearMessages {
        type: 'ai/clear-messages';
    }

    export const CLEAR_MESSAGES: ClearMessages = { type: 'ai/clear-messages' };

    export interface Toggle {
        type: 'ai/toggle';
    }

    export const TOGGLE: Toggle = { type: 'ai/toggle' };
}

export type AiAction = (
    AiAction.SetVisible |
    AiAction.SetSize |
    AiAction.AddUserMessage |
    AiAction.AddAssistantMessage |
    AiAction.SetLoading |
    AiAction.SetError |
    AiAction.ClearError |
    AiAction.ClearMessages |
    AiAction.Toggle
);

export const reduceAi = (state: AiState = DEFAULT, action: AiAction): AiState => {
    switch (action.type) {
        case 'ai/set-visible': return {
            ...state,
            visible: action.visible,
        };
        case 'ai/set-size': return {
            ...state,
            size: action.size,
        };
        case 'ai/add-user-message': {
            if (!action.content.trim()) return state;
            return {
                ...state,
                messages: [
                    ...state.messages,
                    {
                        role: Ai.MessageRole.User,
                        content: action.content,
                        id: uuidv4(),
                        timestamp: Date.now()
                    }
                ]
            };
        }
        case 'ai/add-assistant-message': return {
            ...state,
            messages: [
                ...state.messages,
                {
                    role: Ai.MessageRole.Assistant,
                    content: action.content,
                    id: uuidv4(),
                    timestamp: Date.now()
                }
            ]
        };
        case 'ai/set-loading': return {
            ...state,
            loading: action.loading,
        };
        case 'ai/set-error': return {
            ...state,
            error: action.error,
        };
        case 'ai/clear-error': return {
            ...state,
            error: null,
        };
        case 'ai/clear-messages': return {
            ...state,
            messages: [],
        };
        case 'ai/toggle': return {
            ...state,
            visible: !state.visible,
        };
        default: return state;
    }
}; 