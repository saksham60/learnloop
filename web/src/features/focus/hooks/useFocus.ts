"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getTodayFocus, refreshFocus } from "@/features/focus/api";

export function useTodayFocus() {
  return useQuery({
    queryKey: ["focus", "today"],
    queryFn: getTodayFocus,
  });
}

export function useRefreshFocus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshFocus,
    onSuccess: (data) => {
      queryClient.setQueryData(["focus", "today"], data);
    },
  });
}
