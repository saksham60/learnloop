"use client";

import { BookOpen, GitPullRequest, Link2, Users } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/common/StatCard";
import { useSchoolAdminOverview } from "@/features/school-admin/hooks/useSchoolAdmin";
import { isFeatureUnavailableError } from "@/lib/api/errors";

export function OverviewCards() {
  const overviewQuery = useSchoolAdminOverview();

  if (overviewQuery.isLoading) {
    return <LoadingState title="Loading school admin overview" description="Preparing school operations signals." />;
  }

  if (overviewQuery.error) {
    if (isFeatureUnavailableError(overviewQuery.error)) {
      return (
        <EmptyState
          title="School admin overview is being connected"
          description="This feature is being connected to the backend."
        />
      );
    }

    return (
      <ErrorState
        title="We could not load school overview"
        description="Try again. If the issue persists, the backend may still be warming up."
        onRetry={() => void overviewQuery.refetch()}
      />
    );
  }

  const data = overviewQuery.data;
  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <StatCard title="Pending approvals" value={data.pending_approvals} detail="Teacher and parent access requests" icon={GitPullRequest} tone="warning" />
      <StatCard title="Total students" value={data.total_students} detail="Students linked to this school" icon={Users} />
      <StatCard title="Total teachers" value={data.total_teachers} detail="Approved teachers in this school" icon={Users} />
      <StatCard title="Total parents" value={data.total_parents} detail="Approved parents in this school" icon={Users} />
      <StatCard title="Active classes" value={data.active_classes} detail="Current class structures" icon={BookOpen} />
      <StatCard
        title="Relationships"
        value={data.teacher_student_relations + data.parent_student_relations}
        detail="Teacher-student and parent-student links"
        icon={Link2}
        tone="success"
      />
    </div>
  );
}
