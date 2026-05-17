"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchBackendHealth } from "@/features/health/api";

export function useBackendHealth() {
  return useQuery({
    queryKey: ["backend", "health"],
    queryFn: fetchBackendHealth,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
