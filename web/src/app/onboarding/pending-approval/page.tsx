"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/common/LoadingState";
import { ApprovalStatusCard } from "@/features/onboarding/components/ApprovalStatusCard";
import { useCurrentProfile } from "@/features/auth/hooks/useCurrentProfile";
import { getPostAuthDestination } from "@/features/role-gate/utils";

export default function PendingApprovalPage() {
  const router = useRouter();
  const profileQuery = useCurrentProfile();
  const profile = profileQuery.data;

  useEffect(() => {
    if (profile?.approval_status === "active" && profile.role !== "pending") {
      router.replace(getPostAuthDestination(profile));
    }
  }, [profile, router]);

  if (profileQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <LoadingState title="Checking approval status" description="Refreshing your LearnLoop access state." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <ApprovalStatusCard
        profile={profile}
        title="Approval requested"
        description="Your request has been sent to the school admin. You will get access once the school approves your account."
        onRefresh={() => void profileQuery.refetch()}
      />
    </div>
  );
}
