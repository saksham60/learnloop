"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleSelectionCards } from "@/features/onboarding/components/RoleSelectionCards";
import { useCurrentProfile } from "@/features/auth/hooks/useCurrentProfile";
import { getPostAuthDestination } from "@/features/role-gate/utils";
import { useSupabaseAuth } from "@/providers/SupabaseProvider";

export default function OnboardingRolePage() {
  const router = useRouter();
  const { isEnabled, isReady, user } = useSupabaseAuth();
  const profileQuery = useCurrentProfile();

  useEffect(() => {
    if (!isEnabled || !isReady) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (profileQuery.data && profileQuery.data.role !== "pending") {
      router.replace(getPostAuthDestination(profileQuery.data));
    }
  }, [isEnabled, isReady, profileQuery.data, router, user]);

  if (!isReady || (profileQuery.isLoading && user)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <LoadingState title="Preparing onboarding" description="Checking your LearnLoop profile." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6">
      <PageHeader
        eyebrow="Onboarding"
        title="Welcome to LearnLoop AI"
        description="Tell us how you will use LearnLoop."
      />
      <RoleSelectionCards />
    </div>
  );
}
