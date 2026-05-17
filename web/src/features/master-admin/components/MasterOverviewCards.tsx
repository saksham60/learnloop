"use client";

import { Building2, HeartPulse, ShieldCheck, Users } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/common/StatCard";
import { useMasterOverview } from "@/features/master-admin/hooks/useMasterAdmin";
import { isFeatureUnavailableError } from "@/lib/api/errors";

export function MasterOverviewCards() {
  const overviewQuery = useMasterOverview();

  if (overviewQuery.isLoading) {
    return <LoadingState title="Loading platform overview" description="Preparing master admin metrics." />;
  }

  if (overviewQuery.error && isFeatureUnavailableError(overviewQuery.error)) {
    return (
      <EmptyState
        title="Master overview is being connected"
        description="This feature is being connected to the backend."
      />
    );
  }

  if (overviewQuery.error) {
    return (
      <ErrorState
        title="We could not load platform overview"
        description="Try again. If the issue persists, the backend may still be warming up."
        onRetry={() => void overviewQuery.refetch()}
      />
    );
  }

  const data = overviewQuery.data;
  if (!data) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <StatCard title="Total schools" value={data.total_schools} detail="Schools provisioned on LearnLoop" icon={Building2} />
      <StatCard title="Active schools" value={data.active_schools} detail="Currently active organizations" icon={Building2} tone="success" />
      <StatCard title="Total users" value={data.total_users} detail="Accounts across all schools" icon={Users} />
      <StatCard title="Pending school admin setup" value={data.pending_school_admin_setup} detail="Schools still waiting for an admin" icon={ShieldCheck} tone="warning" />
      <StatCard title="Platform health" value={data.platform_health} detail="Placeholder health signal" icon={HeartPulse} tone="success" />
    </div>
  );
}
