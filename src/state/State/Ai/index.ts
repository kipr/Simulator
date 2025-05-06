import { Size } from '../../../components/interface/Widget';

/**
 * Message role types for Ai messages
 */
export enum MessageRole {
    User = 'user',
    Assistant = 'assistant',
    System = 'system'
}

/**
 * Represents a single message in the chat
 */
export interface Message {
    /** The role of the message sender (user or assistant) */
    role: MessageRole;

    /** The content of the message */
    content: string;

    /** Unique ID for the message */
    id: string;

    /** Timestamp when the message was created */
    timestamp: number;
}

/**
 * Represents the state of a Ai chat session
 */
export interface AiState {
    /** Whether the chat window is visible */
    visible: boolean;

    /** History of chat messages */
    messages: Message[];

    /** Current size of the chat window */
    size: Size;

    /** Whether a request is currently in progress */
    loading: boolean;

    /** Last error message, if any */
    error: string | null;
}

/**
 * Creates a default Claude Ai state
 */
export const DEFAULT: AiState = {
    visible: false,
    messages: [],
    size: Size.PARTIAL,
    loading: false,
    error: null
};