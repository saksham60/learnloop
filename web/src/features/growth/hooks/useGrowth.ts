"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  completeGrowthActivity,
  createGrowthActivity,
  listGrowthActivities,
} from "@/features/growth/api";

export function useGrowthActivities() {
  return useQuery({
    queryKey: ["growth", "activities"],
    queryFn: listGrowthActivities,
  });
}

export function useCreateGrowthActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGrowthActivity,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["growth", "activities"] });
    },
  });
}

export function useCompleteGrowthActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeGrowthActivity,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["growth", "activities"] });
    },
  });
}
