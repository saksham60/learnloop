"use client";

import { useQuery } from "@tanstack/react-query";

import { listSchools } from "@/features/schools/api";

export function useSchools(search?: string) {
  return useQuery({
    queryKey: ["schools", search ?? ""],
    queryFn: () => listSchools(search),
  });
}
