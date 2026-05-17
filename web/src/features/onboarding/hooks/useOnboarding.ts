"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitRoleOnboarding } from "@/features/onboarding/api";

export function useSubmitOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitRoleOnboarding,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
