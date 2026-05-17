export type TeacherClass = {
  id: string;
  name: string;
  code?: string | null;
  grade_level?: string | null;
  subject?: string | null;
  student_count: number;
};

export type ClassAnalytics = {
  class_id: string;
  student_count: number;
  homework_count: number;
};

export type ClassWeakTopic = {
  class_id: string;
  topic: string;
  risk_score: number;
};

export type ClassMisconception = {
  class_id: string;
  misconception: string;
  signal_count: number;
};

export type TeacherInsightResponse = {
  run_id: string;
  selected_agent: string;
  response: string;
  observation_count: number;
};
