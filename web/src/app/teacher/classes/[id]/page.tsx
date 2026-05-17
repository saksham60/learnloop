"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentLoopTimeline } from "@/features/student-companion/components/AgentLoopTimeline";
import { ClassOverview } from "@/features/teacher-analytics/components/ClassOverview";
import { HintDependencyChart } from "@/features/teacher-analytics/components/HintDependencyChart";
import { MisconceptionPanel } from "@/features/teacher-analytics/components/MisconceptionPanel";
import { WeakTopicsChart } from "@/features/teacher-analytics/components/WeakTopicsChart";
import {
  useClassAnalytics,
  useClassMisconceptions,
  useClassWeakTopics,
  useTeacherClasses,
  useTeacherInsight,
  useTeacherInsightSteps,
} from "@/features/teacher-analytics/hooks/useTeacherAnalytics";

export default function TeacherClassDetailPage() {
  const params = useParams<{ id: string }>();
  const [runId, setRunId] = useState<string | null>(null);
  const [insightText, setInsightText] = useState<string | null>(null);

  const classesQuery = useTeacherClasses();
  const analyticsQuery = useClassAnalytics(params.id);
  const weakTopicsQuery = useClassWeakTopics(params.id);
  const misconceptionsQuery = useClassMisconceptions(params.id);
  const insightMutation = useTeacherInsight();
  const stepsQuery = useTeacherInsightSteps(runId);

  const classMeta = classesQuery.data?.find((item) => item.id === params.id);

  async function handleGenerateInsight() {
    try {
      const result = await insightMutation.mutateAsync(params.id);
      setRunId(result?.run_id ?? null);
      setInsightText(result?.response ?? null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate class insight.");
    }
  }

  if (analyticsQuery.isLoading) {
    return <LoadingState title="Loading class analytics" description="Gathering classroom signals." />;
  }

  if (analyticsQuery.error) {
    return <ErrorState onRetry={() => void analyticsQuery.refetch()} />;
  }

  if (!analyticsQuery.data) {
    return (
      <EmptyState
        title="Class analytics unavailable"
        description="This class has not been connected to analytics yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Class analytics"
        title={classMeta?.name || "Class detail"}
        description="Review weak topics, misconceptions, and a teacher-facing AI summary for this class."
        action={
          <Button onClick={handleGenerateInsight} disabled={insightMutation.isPending}>
            Generate AI summary
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-6">
          <ClassOverview analytics={analyticsQuery.data} />
          <WeakTopicsChart items={weakTopicsQuery.data ?? []} />
          <HintDependencyChart items={weakTopicsQuery.data ?? []} />
          <MisconceptionPanel items={misconceptionsQuery.data ?? []} />
        </div>

        <div className="space-y-6">
          <AgentLoopTimeline
            steps={stepsQuery.data}
            title="Teacher insight trace"
            description="The platform plans, pulls class analytics, observes outputs, and then drafts the summary."
          />

          <Card>
            <CardHeader>
              <CardTitle>AI summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              {insightText ||
                "Generate a teacher insight summary to see a compact explanation based on class analytics."}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
