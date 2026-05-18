export type HomeworkSummary = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  due_at?: string | null;
  question_count: number;
};

export type HomeworkQuestion = {
  id: string;
  prompt: string;
  order_index: number;
};

export type HomeworkDetail = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  due_at?: string | null;
  questions: HomeworkQuestion[];
};

export type HomeworkAttemptPayload = {
  question_id?: string | null;
  answer_text: string;
  hints_used?: number;
  is_correct?: boolean | null;
  score?: number | null;
};

export type HomeworkAttemptResult = {
  attempt_id: string;
  attempt_number: number;
  status: string;
};

export type HomeworkSubmitResult = {
  id: string;
  status: string;
};

export type HomeworkAnalytics = {
  class_id?: string;
  student_count?: number;
  homework_count?: number;
  [key: string]: string | number | boolean | null | undefined;
};

export type HomeworkQuestionCreate = {
  prompt: string;
  order_index: number;
};

export type HomeworkCreatePayload = {
  title: string;
  description?: string | null;
  school_id: string;
  class_id?: string | null;
  subject_id?: string | null;
  due_at?: string | null;
  questions: HomeworkQuestionCreate[];
};

export type HomeworkCreateResult = {
  id: string;
  title: string;
  status: string;
};

export type HomeworkCoachInput = {
  homeworkId: string;
  questionId?: string | null;
  userMessage: string;
  studentSaidStuck?: boolean;
};

export type HomeworkCoachResult = {
  run_id: string | null;
  selected_agent: string;
  response: string;
  observation_count: number;
};
