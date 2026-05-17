"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createHomework,
  fetchAgentRunSteps,
  getHomework,
  getHomeworkAnalytics,
  listHomework,
  requestHomeworkCoach,
  submitHomework,
  submitHomeworkAttempt,
} from "@/features/homework/api";

export function useHomeworkList() {
  return useQuery({
    queryKey: ["homework", "list"],
    queryFn: listHomework,
  });
}

export function useHomeworkDetail(homeworkId?: string) {
  return useQuery({
    queryKey: ["homework", "detail", homeworkId],
    queryFn: () => getHomework(homeworkId as string),
    enabled: Boolean(homeworkId),
  });
}

export function useHomeworkAnalytics(homeworkId?: string) {
  return useQuery({
    queryKey: ["homework", "analytics", homeworkId],
    queryFn: () => getHomeworkAnalytics(homeworkId as string),
    enabled: Boolean(homeworkId),
  });
}

export function useHomeworkAttempt(homeworkId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof submitHomeworkAttempt>[1]) =>
      submitHomeworkAttempt(homeworkId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["homework", "detail", homeworkId] });
    },
  });
}

export function useHomeworkSubmit(homeworkId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => submitHomework(homeworkId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["homework", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["homework", "detail", homeworkId] });
    },
  });
}

export function useCreateHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHomework,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["homework", "list"] });
    },
  });
}

export function useHomeworkCoach() {
  return useMutation({
    mutationFn: requestHomeworkCoach,
  });
}

export function useHomeworkCoachSteps(runId?: string | null) {
  return useQuery({
    queryKey: ["homework", "coach-steps", runId],
    queryFn: () => fetchAgentRunSteps(runId as string),
    enabled: Boolean(runId),
  });
}
