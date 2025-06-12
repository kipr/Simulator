import * as Ai from '../state/State/Ai';
import { AiAction } from "state/reducer";
import { auth } from "../firebase/firebase";
import sequentialize from './sequentialize';
import store from '../state';
import ProgrammingLanguage from 'programming/compiler/ProgrammingLanguage';
import Robot from 'state/State/Robot';
import { Dispatch } from 'redux';

export interface SendMessageParams {
  content: string;
  code: string;
  language: ProgrammingLanguage;
  console: string;
  robot: Robot;
}

interface ApiResponse {
  content: Array<{ text: string }>;
}

interface ErrorResponse {
  error?: string | { message: string };
}

// Try to catch possible misspellings
const includesChallenge = (s: string) => {
  return s.includes('challenge') ||
  s.includes('Challenge') ||
  s.includes('chalenge') ||
  s.includes('Chalenge') ||
  s.includes('chelenge') ||
  s.includes('Chelenge') ||
  s.includes('chalenje') ||
  s.includes('Chalenje') ||
  s.includes('callenge') ||
  s.includes('Callenge');
};

// Thunk action creator for sending messages
const sendMessage_ = async (dispatch: Dispatch, { content, code, language, console, robot }: SendMessageParams) => {
  try {
    dispatch(AiAction.SEND_MESSAGE_START);

    // Get auth token from Firebase Auth
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Not authenticated. Please sign in.');
    }
    const token = await user.getIdToken();

    dispatch(AiAction.setVisible({ visible: true }));

    // Add the user message first
    dispatch(AiAction.addUserMessage({ content }));

    const allMsgs = store.getState().ai.messages;
    const challengeMentioned = allMsgs
      .filter(({ role }) => role === Ai.MessageRole.User)
      .map((msg) => msg.content)
      .filter((el) => includesChallenge(el))
      .length > 0;

    // Call Claude API
    const response = await fetch('/api/ai/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: allMsgs
          .filter(({ role }) => role === Ai.MessageRole.Assistant || role === Ai.MessageRole.User)
          .map(Ai.toApiMessage),
        code,
        language,
        console,
        robot,
        challengeMentioned,
      })
    });

    if (!response.ok) {
      const errorData = await response.json() as ErrorResponse;
      if (errorData.error && typeof errorData.error === 'string') {
        throw new Error(errorData.error);
      }
      if (errorData.error && typeof errorData.error === 'object' && 'message' in errorData.error) {
        throw new Error(errorData.error?.message || 'An error occurred while communicating with Tutor.');
      }
      throw new Error('An error occurred while communicating with Tutor.');
    }

    const data = await response.json() as ApiResponse;
    const assistantMessage = data.content[0].text;

    dispatch(AiAction.sendMessageSuccess({ content: assistantMessage }));
  } catch (error) {
    window.console.error('Error sending message to Claude API:', error);
    let errorMessage = 'An error occurred while communicating with Tutor.';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    dispatch(AiAction.sendMessageFailure({ error: errorMessage }));
  } finally {
    dispatch(AiAction.setLoading({ loading: false }));
  }
};

export const sendMessage = sequentialize(sendMessage_);
