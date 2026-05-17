"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  fetchAgentRunSteps,
  getClassAnalytics,
  getClassMisconceptions,
  getClassWeakTopics,
  listTeacherClasses,
  requestTeacherInsight,
} from "@/features/teacher-analytics/api";

export function useTeacherClasses() {
  return useQuery({
    queryKey: ["teacher", "classes"],
    queryFn: listTeacherClasses,
  });
}

export function useClassAnalytics(classId?: string) {
  return useQuery({
    queryKey: ["teacher", "class-analytics", classId],
    queryFn: () => getClassAnalytics(classId as string),
    enabled: Boolean(classId),
  });
}

export function useClassWeakTopics(classId?: string) {
  return useQuery({
    queryKey: ["teacher", "weak-topics", classId],
    queryFn: () => getClassWeakTopics(classId as string),
    enabled: Boolean(classId),
  });
}

export function useClassMisconceptions(classId?: string) {
  return useQuery({
    queryKey: ["teacher", "misconceptions", classId],
    queryFn: () => getClassMisconceptions(classId as string),
    enabled: Boolean(classId),
  });
}

export function useTeacherInsight() {
  return useMutation({
    mutationFn: requestTeacherInsight,
  });
}

export function useTeacherInsightSteps(runId?: string | null) {
  return useQuery({
    queryKey: ["teacher", "insight-steps", runId],
    queryFn: () => fetchAgentRunSteps(runId as string),
    enabled: Boolean(runId),
  });
}
