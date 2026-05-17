"use client";

import { useParams } from "next/navigation";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { HomeworkAttemptPanel } from "@/features/homework/components/HomeworkAttemptPanel";
import { useHomeworkDetail } from "@/features/homework/hooks/useHomework";
import { isFeatureUnavailableError } from "@/lib/api/errors";

export default function StudentHomeworkDetailPage() {
  const params = useParams<{ id: string }>();
  const homeworkQuery = useHomeworkDetail(params.id);

  if (homeworkQuery.isLoading) {
    return <LoadingState title="Loading homework detail" description="Pulling the current assignment." />;
  }

  if (homeworkQuery.error) {
    if (isFeatureUnavailableError(homeworkQuery.error)) {
      return (
        <EmptyState
          title="Homework detail is being connected"
          description="This feature is being connected to the backend."
        />
      );
    }
    return <ErrorState onRetry={() => void homeworkQuery.refetch()} />;
  }

  if (!homeworkQuery.data) {
    return (
      <EmptyState
        title="Homework not found"
        description="This homework item could not be found or is not available yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Homework detail"
        title={homeworkQuery.data.title}
        description="Keep the learning flow simple: try first, then request a hint or explanation if needed."
      />
      <HomeworkAttemptPanel homework={homeworkQuery.data} />
    </div>
  );
}
