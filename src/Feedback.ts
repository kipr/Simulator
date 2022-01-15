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
  includeUserData: boolean;
}
  
export const DEFAULT_FEEDBACK: Feedback = {
  feedback: "Give a helpful description of a problem you're facing, or a feature you'd like to request",
  sentiment: Sentiment.None,
  email: "",
  includeAnonData: true,
  includeUserData: false,
};