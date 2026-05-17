"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCurrentProfile, isProfileMissingError } from "@/features/auth/api";
import { ApiError } from "@/lib/api/errors";
import { useDemoProfile } from "@/lib/demo/demo-auth";
import { useSupabaseAuth } from "@/providers/SupabaseProvider";

export function useCurrentProfile() {
  const { isReady, user } = useSupabaseAuth();
  const demoProfile = useDemoProfile();

  return useQuery({
    queryKey: ["auth", "me", demoProfile?.id ?? user?.id ?? "guest"],
    queryFn: demoProfile ? async () => demoProfile : fetchCurrentProfile,
    enabled: Boolean(demoProfile) || (isReady && Boolean(user)),
    retry(failureCount, error) {
      if (demoProfile) {
        return false;
      }
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
