"use client";

import Link from "next/link";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HintDependencyChart } from "@/features/teacher-analytics/components/HintDependencyChart";
import { MisconceptionPanel } from "@/features/teacher-analytics/components/MisconceptionPanel";
import { WeakTopicsChart } from "@/features/teacher-analytics/components/WeakTopicsChart";
import {
  useClassMisconceptions,
  useClassWeakTopics,
  useTeacherClasses,
} from "@/features/teacher-analytics/hooks/useTeacherAnalytics";

export default function TeacherAnalyticsPage() {
  const classesQuery = useTeacherClasses();
  const firstClassId = classesQuery.data?.[0]?.id;
  const weakTopicsQuery = useClassWeakTopics(firstClassId);
  const misconceptionsQuery = useClassMisconceptions(firstClassId);

  if (classesQuery.isLoading) {
    return <LoadingState title="Loading analytics" description="Preparing teacher analytics charts." />;
  }

  if (classesQuery.error) {
    return <ErrorState onRetry={() => void classesQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Teacher analytics"
        description="Review weak topics, hint dependence, and misconceptions at a glance."
        action={
          firstClassId ? (
            <Button asChild>
              <Link href={`/teacher/classes/${firstClassId}`}>Open detailed class view</Link>
            </Button>
          ) : undefined
        }
      />

      {!classesQuery.data?.length ? (
        <EmptyState
          title="No class analytics yet"
          description="Analytics will populate once the teacher has connected classes."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-6">
            <WeakTopicsChart items={weakTopicsQuery.data ?? []} />
            <HintDependencyChart items={weakTopicsQuery.data ?? []} />
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tracked classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {classesQuery.data.map((item) => (
                  <Link
                    key={item.id}
                    href={`/teacher/classes/${item.id}`}
                    className="block rounded-2xl border border-border bg-background/80 px-4 py-3 transition hover:border-primary/40"
                  >
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.student_count} students
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
            <MisconceptionPanel items={misconceptionsQuery.data ?? []} />
          </div>
        </div>
      )}
    </div>
  );
}
