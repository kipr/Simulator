import { Sentiment } from '../../Feedback';
import { RootState } from '../Root';

interface FeedbackData {
  feedback: string;
  sentiment: Sentiment;
  includeAnonData: boolean;
  email?: string;
  state?: RootState;
  userAgent?: string;
}

export interface FeedbackResponse {
  message: string,
  networkError: boolean,
}

export const sendFeedback = (rootState: RootState): Promise<FeedbackResponse> => {
  
  return new Promise<FeedbackResponse>((resolve, reject) => {
    const feedback = rootState.feedback;

    // minor form checking
    if (feedback.feedback === '') {
      reject({ message: 'Please supply some feedback!', networkError: false });
      return;
    }
    if (feedback.sentiment === Sentiment.None) {
      reject({ message: 'Please select how you feel about the simulator!', networkError: false });
      return;
    }

    // construct some json and send it to the backend
    const body: FeedbackData = {
      feedback: feedback.feedback,
      sentiment: feedback.sentiment,
      includeAnonData: feedback.includeAnonData,
      email: feedback.email,
      state: null,
      userAgent: null,
    };

    if (feedback.includeAnonData) {
      body.state = rootState;
      body.userAgent = window.navigator.userAgent;
    }

    const req: XMLHttpRequest = new XMLHttpRequest();
    req.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const responseJSON = JSON.parse(req.responseText);

      let message = ''; 
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ('message' in responseJSON && typeof responseJSON.message === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        message = responseJSON.message as string;
      }

      if (req.status === 200) {
        if (message === '') {
          message = req.responseText;
        }
        resolve({ message: message, networkError: false });
      } else {
        if (message === '') {
          message = 'Error sending feedback: server response invalid.';
        }
        reject({ message: message, networkError: true });
      }
    };

    req.onerror = (err) => {
      console.log(err);
      reject({ message: 'An unknown error occured while sending feedback!', networkError: true });
    };

    req.open('POST', '/feedback');
    req.setRequestHeader('Content-Type', 'application/json');

    try {
      req.send(JSON.stringify(body));
    } catch {
      reject({ error: 'An unknown server error occurred!', networkError: true });
    }
  });    
};