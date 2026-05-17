"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeakTopics } from "@/features/progress/hooks/useProgress";
import { isFeatureUnavailableError } from "@/lib/api/errors";

export function WeakTopicList() {
  const weakTopicsQuery = useWeakTopics();

  if (weakTopicsQuery.isLoading) {
    return <LoadingState title="Loading weak topics" description="Reviewing the latest topic signals." />;
  }

  if (weakTopicsQuery.error) {
    if (isFeatureUnavailableError(weakTopicsQuery.error)) {
      return (
        <EmptyState
          title="Weak topics are being connected"
          description="This feature is being connected to the backend."
        />
      );
    }
    return <ErrorState onRetry={() => void weakTopicsQuery.refetch()} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weak topics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {weakTopicsQuery.data?.length ? (
          weakTopicsQuery.data.map((topic) => (
            <div key={`${topic.subject}-${topic.topic}`} className="rounded-2xl border border-border bg-background/80 px-4 py-3">
              <p className="font-medium">{topic.topic}</p>
              <p className="mt-1 text-sm text-muted-foreground">{topic.subject}</p>
              <p className="mt-2 text-sm text-primary">Confidence score: {topic.score.toFixed(2)}</p>
            </div>
          ))
        ) : (
          <EmptyState
            title="No weak topics yet"
            description="Weak topics will show up once enough study events are available."
          />
        )}
      </CardContent>
    </Card>
  );
}
