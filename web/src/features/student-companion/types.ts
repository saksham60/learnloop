export type CompanionMode =
  | "teach_me_slowly"
  | "give_me_a_hint"
  | "check_my_answer"
  | "i_am_stuck"
  | "explain_after_i_try"
  | "revision_mode";

export type CompanionMessage = {
  id: string;
  role: "student" | "ai" | "system";
  body: string;
  label?: string;
  createdAt: string;
};

export type LearningChatPayload = {
  session_id?: string | null;
  message: string;
  attempts_count: number;
  hints_used: number;
  student_said_stuck: boolean;
  explain_requested: boolean;
};

export type LearningGuidedResponse = {
  response?: string;
  hint?: string;
  explanation?: string;
  decision?: string;
  status?: string;
  source?: "backend" | "fallback";
  fallback_notice?: string;
  agent_run_id?: string | null;
};

export type LearningAttemptPayload = {
  session_id?: string | null;
  answer: string;
};

export type AgentRunRequest = {
  session_id?: string | null;
  request_type: string;
  user_message: string;
  metadata?: Record<string, unknown>;
};

export type AgentRunResult = {
  run_id: string;
  selected_agent: string;
  response: string;
  observation_count: number;
};

export type AgentStep = {
  id: string;
  step_name: string;
  agent_name: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
};
