export type ProgressAskPayload = {
  question: string;
};

export type ProgressAnswer = {
  answer: string;
  summary_used: string;
};

export type ProgressSummary = {
  summary: string;
};

export type WeakTopic = {
  subject: string;
  topic: string;
  score: number;
};
