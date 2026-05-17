"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProgressSummary } from "@/features/progress/hooks/useProgress";
import { isFeatureUnavailableError } from "@/lib/api/errors";

export function ProgressSummary() {
  const summaryQuery = useProgressSummary();

  if (summaryQuery.isLoading) {
    return <LoadingState title="Loading progress summary" description="Building your safe structured summary." />;
  }

  if (summaryQuery.error) {
    if (isFeatureUnavailableError(summaryQuery.error)) {
      return (
        <EmptyState
          title="Progress summary is being connected"
          description="This feature is being connected to the backend."
        />
      );
    }
    return <ErrorState onRetry={() => void summaryQuery.refetch()} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Improvement summary</CardTitle>
        <CardDescription>
          LearnLoop only uses safe structured data instead of dumping raw records into the model.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {summaryQuery.data?.summary || "Your summary will appear here after recent study activity is available."}
        </p>
      </CardContent>
    </Card>
  );
}
