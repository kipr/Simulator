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

    // Call Claude API
    const response = await fetch('/api/ai/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: store.getState().ai.messages
          .filter(({ role }) => role === Ai.MessageRole.Assistant || role === Ai.MessageRole.User)
          .map(Ai.toApiMessage),
        code,
        language,
        console,
        robot,
      })
    });

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await response.text();

    if (!response.ok) {
      let errorData: ErrorResponse;
      try {
        errorData = JSON.parse(responseText) as ErrorResponse;
      } catch (jsonError) {
        // If response is not JSON, return the text content
        throw new Error(`Server error (${response.status}): ${responseText || 'Unknown error'}`);
      }

      if (errorData.error && typeof errorData.error === 'string') {
        throw new Error(errorData.error);
      }
      if (errorData.error && typeof errorData.error === 'object' && 'message' in errorData.error) {
        throw new Error(errorData.error?.message || 'An error occurred while communicating with Tutor.');
      }
      throw new Error('An error occurred while communicating with Tutor.');
    }

    let data: ApiResponse;
    try {
      data = JSON.parse(responseText) as ApiResponse;
    } catch (jsonError) {
      throw new Error('Invalid response from server: expected JSON');
    }
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
