export enum Sentiment {
  None = 0,
  Sad,
  Okay,
  Happy,
}

export interface Feedback {
  feedback: string;
  sentiment: Sentiment;
  email: string;
  includeAnonData: boolean;
  message: string;
  error: boolean;
}
  
export const DEFAULT_FEEDBACK: Feedback = {
  feedback: "",
  sentiment: Sentiment.None,
  email: "",
  includeAnonData: true,
  message: "",
  error: false,
};