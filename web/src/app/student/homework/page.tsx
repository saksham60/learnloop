"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { HomeworkList } from "@/features/homework/components/HomeworkList";
import { useHomeworkList } from "@/features/homework/hooks/useHomework";
import { isFeatureUnavailableError } from "@/lib/api/errors";
import { EmptyState } from "@/components/common/EmptyState";

export default function StudentHomeworkPage() {
  const homeworkQuery = useHomeworkList();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Homework"
        title="Attempt-first homework support"
        description="See your assigned work, open one task at a time, and use hints only after trying first."
      />

      {homeworkQuery.isLoading ? <LoadingState title="Loading homework" description="Fetching your assignments." /> : null}

      {homeworkQuery.error ? (
        isFeatureUnavailableError(homeworkQuery.error) ? (
          <EmptyState
            title="Homework is being connected"
            description="This feature is being connected to the backend."
          />
        ) : (
          <ErrorState onRetry={() => void homeworkQuery.refetch()} />
        )
      ) : null}

      {!homeworkQuery.isLoading && !homeworkQuery.error ? <HomeworkList items={homeworkQuery.data ?? []} /> : null}
    </div>
  );
}
