import { Size } from '../../../components/interface/Widget';

/**
 * Message role types for Ai messages
 */
export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
  Error = 'error'
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

export const toApiMessage = (message: Message) => ({
  role: message.role,
  content: message.content,
});

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
}

/**
 * Creates a default Claude Ai state
 */
export const DEFAULT: AiState = {
  visible: false,
  messages: [],
  size: Size.PARTIAL,
  loading: false
};