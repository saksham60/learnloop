export type StudentDashboardStats = {
  pending_homework_count: number;
  active_focus_count: number;
  recent_attempts_count: number;
  source: "backend" | "fallback";
  fallback_message?: string;
};

export type StudentEvent = {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type StudentFocusSignal = {
  id: string;
  title: string;
  description?: string | null;
  score: number;
  status: string;
};

export type StudentSectionResult<T> = {
  items: T[];
  source: "backend" | "fallback";
  fallback_message?: string;
};
