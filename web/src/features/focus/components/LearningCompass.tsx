"use client";

import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { FocusCard } from "@/features/focus/components/FocusCard";
import { useRefreshFocus, useTodayFocus } from "@/features/focus/hooks/useFocus";
import { isFeatureUnavailableError } from "@/lib/api/errors";

export function LearningCompass() {
  const focusQuery = useTodayFocus();
  const refreshMutation = useRefreshFocus();

  async function handleRefresh() {
    try {
      await refreshMutation.mutateAsync({ reason: "manual refresh from web app" });
      toast.success("Learning Compass refreshed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not refresh focus right now.");
    }
  }

  if (focusQuery.isLoading) {
    return <LoadingState title="Loading Learning Compass" description="Pulling today’s focus signals." />;
  }

  if (focusQuery.error) {
    if (isFeatureUnavailableError(focusQuery.error)) {
      return (
        <EmptyState
          title="Learning Compass is being connected"
          description="This feature is being connected to the backend."
          actionLabel="Try refresh"
          onAction={() => void focusQuery.refetch()}
        />
      );
    }
    return <ErrorState onRetry={() => void focusQuery.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Your focus order is built from recent attempts, hints, and missed practice.
        </p>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshMutation.isPending}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {focusQuery.data?.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {focusQuery.data.map((item) => (
            <FocusCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No focus areas yet"
          description="Refresh the Learning Compass after some learning events land in the backend."
          actionLabel="Refresh focus"
          onAction={handleRefresh}
        />
      )}
    </div>
  );
}
