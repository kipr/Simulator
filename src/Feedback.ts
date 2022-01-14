export enum Sentiment {
  Sad = 1,
  Okay,
  Happy,
}

export interface Feedback {
  name: string;
  email: string;
  feedback: string;
  sentiment: Sentiment;
}
  
export const DEFAULT_FEEDBACK: Feedback = {
  name: "",
  email: "",
  feedback: "Give a helpful description of a problem you're facing, or a feature you'd like to request",
  sentiment: Sentiment.Okay,
};