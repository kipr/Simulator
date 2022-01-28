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

const sendFeedback = (rootState: RootState): Promise<string> => {
  
  return new Promise<string>((resolve, reject) => {
    const feedback = rootState.feedback;

    // minor form checking
    if (feedback.feedback === '') {
      reject('Please supply some feedback!');
      return;
    }
    if (feedback.sentiment === Sentiment.None) {
      reject('Please select how you feel about the simulator!');
      return;
    }

    // construct some json and send it to the backend
    const body: FeedbackData = {
      feedback: feedback.feedback,
      sentiment: feedback.sentiment,
      includeAnonData: feedback.includeAnonData,
      email: null,
      state: null,
      userAgent: null,
    };

    if (feedback.includeAnonData) {
      body.state = rootState;
      body.userAgent = window.navigator.userAgent;
    }

    const req = new XMLHttpRequest();
    req.onload = () => {
      if (req.status !== 200) {
        if ('error' in JSON.parse(req.responseText)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          reject(JSON.parse(req.responseText).error);
        }
        reject('Error sending feedback: server response invalid. Please try again.');
      } else {
        if ('message' in JSON.parse(req.responseText)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          resolve(JSON.parse(req.responseText).message);
        } else {
          resolve(req.responseText);
        }
      }
    };

    req.onerror = (err) => {
      console.log(err);
      reject('epic fail');
    };

    req.open('POST', '/feedback');
    req.setRequestHeader('Content-Type', 'application/json');

    req.send(JSON.stringify(body));
  });    
};

export default sendFeedback;