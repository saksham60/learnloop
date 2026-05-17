"use client";

import Link from "next/link";

import { ApprovalStatusCard } from "@/features/onboarding/components/ApprovalStatusCard";
import { Button } from "@/components/ui/button";
import { useCurrentProfile } from "@/features/auth/hooks/useCurrentProfile";

export default function RejectedOnboardingPage() {
  const profileQuery = useCurrentProfile();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 md:px-6">
      <ApprovalStatusCard
        profile={profileQuery.data}
        title="Your access request was not approved"
        description="You can choose another school or contact the school admin for clarification."
      />
      <Button asChild>
        <Link href="/onboarding/role">Choose another school</Link>
      </Button>
    </div>
  );
}
