"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  fetchAgentRunSteps,
  requestExplanationAfterEffort,
  requestLearningHint,
  runAgent,
  sendLearningChat,
  submitLearningAttempt,
} from "@/features/student-companion/api";

export function useLearningChat() {
  return useMutation({ mutationFn: sendLearningChat });
}

export function useLearningHint() {
  return useMutation({ mutationFn: requestLearningHint });
}

export function useLearningExplanation() {
  return useMutation({ mutationFn: requestExplanationAfterEffort });
}

export function useLearningAttempt() {
  return useMutation({ mutationFn: submitLearningAttempt });
}

export function useAgentRun() {
  return useMutation({ mutationFn: runAgent });
}

export function useAgentRunSteps(runId?: string | null) {
  return useQuery({
    queryKey: ["agent-run-steps", runId],
    queryFn: () => fetchAgentRunSteps(runId as string),
    enabled: Boolean(runId),
  });
}
