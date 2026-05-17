export type FocusArea = {
  id: string;
  title: string;
  description?: string | null;
  score: number;
  recommended_action?: string | null;
  estimated_minutes?: number;
};

export type FocusRefreshPayload = {
  reason?: string | null;
};
