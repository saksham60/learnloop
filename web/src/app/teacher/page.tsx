"use client";

import Link from "next/link";
import { BarChart3, BookOpenCheck, Users } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassOverview } from "@/features/teacher-analytics/components/ClassOverview";
import { HintDependencyChart } from "@/features/teacher-analytics/components/HintDependencyChart";
import { MisconceptionPanel } from "@/features/teacher-analytics/components/MisconceptionPanel";
import { WeakTopicsChart } from "@/features/teacher-analytics/components/WeakTopicsChart";
import {
  useClassAnalytics,
  useClassMisconceptions,
  useClassWeakTopics,
  useTeacherClasses,
} from "@/features/teacher-analytics/hooks/useTeacherAnalytics";

export default function TeacherDashboardPage() {
  const classesQuery = useTeacherClasses();
  const firstClassId = classesQuery.data?.[0]?.id;
  const analyticsQuery = useClassAnalytics(firstClassId);
  const weakTopicsQuery = useClassWeakTopics(firstClassId);
  const misconceptionsQuery = useClassMisconceptions(firstClassId);

  if (classesQuery.isLoading) {
    return <LoadingState title="Loading teacher dashboard" description="Preparing your class and revision signals." />;
  }

  if (classesQuery.error) {
    return <ErrorState onRetry={() => void classesQuery.refetch()} />;
  }

  if (!classesQuery.data?.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Teacher dashboard"
          title="Classroom visibility"
          description="See classes, weak topics, misconception signals, and guided revision suggestions in one place."
        />
        <EmptyState
          title="No classes connected yet"
          description="Classes will appear here as soon as the teacher profile is linked to classroom data."
        />
      </div>
    );
  }

  const totalStudents = classesQuery.data.reduce((sum, item) => sum + item.student_count, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teacher dashboard"
        title="Classroom signal board"
        description="See classes, weak topics, misconception signals, and guided revision suggestions in one place."
        action={
          <Button asChild>
            <Link href="/teacher/homework/new">Create homework</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Classes"
          value={classesQuery.data.length}
          detail="Active groups linked to this teacher"
          icon={Users}
        />
        <StatCard
          title="Students"
          value={totalStudents}
          detail="Combined student count"
          icon={BookOpenCheck}
          tone="success"
        />
        <StatCard
          title="Analytics focus"
          value={weakTopicsQuery.data?.length ?? 0}
          detail="Weak-topic signals currently visible"
          icon={BarChart3}
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-6">
          <ClassOverview analytics={analyticsQuery.data} />
          <WeakTopicsChart items={weakTopicsQuery.data ?? []} />
          <HintDependencyChart items={weakTopicsQuery.data ?? []} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Classes overview</CardTitle>
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
                    {item.grade_level || "Unspecified grade"} {item.subject ? `- ${item.subject}` : ""}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
          <MisconceptionPanel items={misconceptionsQuery.data ?? []} />
        </div>
      </div>
    </div>
  );
}
