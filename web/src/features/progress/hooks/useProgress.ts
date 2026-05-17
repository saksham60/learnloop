"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { askProgressQuestion, getProgressSummary, getWeakTopics } from "@/features/progress/api";

export function useAskProgressQuestion() {
  return useMutation({ mutationFn: askProgressQuestion });
}

export function useProgressSummary() {
  return useQuery({
    queryKey: ["progress", "summary"],
    queryFn: getProgressSummary,
  });
}

export function useWeakTopics() {
  return useQuery({
    queryKey: ["progress", "weak-topics"],
    queryFn: getWeakTopics,
  });
}
