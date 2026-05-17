"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCurrentProfile, isProfileMissingError } from "@/features/auth/api";
import { ApiError } from "@/lib/api/errors";
import { useSupabaseAuth } from "@/providers/SupabaseProvider";

export function useCurrentProfile() {
  const { isReady, user } = useSupabaseAuth();

  return useQuery({
    queryKey: ["auth", "me", user?.id],
    queryFn: fetchCurrentProfile,
    enabled: isReady && Boolean(user),
    retry(failureCount, error) {
      if (isProfileMissingError(error)) {
        return false;
      }
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
