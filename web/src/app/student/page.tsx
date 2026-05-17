"use client";

import Link from "next/link";
import { BookOpenCheck, Flag, PencilLine, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentProfile } from "@/features/auth/hooks/useCurrentProfile";
import { FocusCard } from "@/features/focus/components/FocusCard";
import { useGrowthActivities } from "@/features/growth/hooks/useGrowth";
import { useHomeworkList } from "@/features/homework/hooks/useHomework";
import { AskMyProgress } from "@/features/progress/components/AskMyProgress";
import {
  useStudentDashboardStats,
  useStudentEvents,
  useStudentFocusSignals,
} from "@/features/student-dashboard/hooks/useStudentDashboard";
import { isFeatureUnavailableError, isNetworkApiError } from "@/lib/api/errors";
import { formatRelativeTime } from "@/lib/utils";

export default function StudentDashboardPage() {
  const { data: profile } = useCurrentProfile();
  const dashboardQuery = useStudentDashboardStats();
  const eventsQuery = useStudentEvents();
  const focusQuery = useStudentFocusSignals();
  const homeworkQuery = useHomeworkList();
  const growthQuery = useGrowthActivities();

  if (dashboardQuery.isLoading && focusQuery.isLoading && homeworkQuery.isLoading) {
    return (
      <LoadingState
        title="Loading your companion dashboard"
        description="Bringing together focus, homework, progress, and growth signals."
      />
    );
  }

  if (dashboardQuery.error && !dashboardQuery.data) {
    return <ErrorState onRetry={() => void dashboardQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student dashboard"
        title={`Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
        description="This dashboard is designed to feel like a daily companion: what needs focus, what is due, and what small win comes next."
        action={
          <Button asChild>
            <Link href="/student/companion">Continue learning</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Pending homework"
          value={dashboardQuery.data?.pending_homework_count ?? 0}
          detail="Assigned work still open"
          icon={BookOpenCheck}
          tone="warning"
        />
        <StatCard
          title="Focus areas"
          value={dashboardQuery.data?.active_focus_count ?? 0}
          detail="Current Learning Compass signals"
          icon={Flag}
        />
        <StatCard
          title="Recent attempts"
          value={dashboardQuery.data?.recent_attempts_count ?? 0}
          detail="Meaningful tries captured recently"
          icon={PencilLine}
          tone="success"
        />
      </div>

      {dashboardQuery.data?.source === "fallback" ? (
        <EmptyState
          title="Dashboard stats are still warming up"
          description={
            dashboardQuery.data.fallback_message ||
            "The student dashboard summary is still being connected to the backend."
          }
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Learning Compass</CardTitle>
            </CardHeader>
            <CardContent>
              {focusQuery.data?.items.length ? (
                <div className="grid gap-4">
                  {focusQuery.data.items.slice(0, 2).map((item) => (
                    <FocusCard
                      key={item.id}
                      item={{
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        score: item.score,
                        recommended_action: `Current status: ${item.status}`,
                      }}
                    />
                  ))}
                </div>
              ) : focusQuery.data?.source === "fallback" ? (
                <EmptyState
                  title="Learning Compass is still being connected"
                  description={
                    focusQuery.data.fallback_message ||
                    "This student focus section is still being connected to the backend."
                  }
                />
              ) : (
                <EmptyState
                  title="No focus signals yet"
                  description="Refresh the Learning Compass after some attempts, hints, or homework activity."
                />
              )}
            </CardContent>
          </Card>

          <AskMyProgress />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending homework</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {homeworkQuery.data?.length ? (
                homeworkQuery.data.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={`/student/homework/${item.id}`}
                    className="block rounded-2xl border border-border bg-background/80 px-4 py-3 transition hover:border-primary/40"
                  >
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.due_at ? `Due ${formatRelativeTime(item.due_at)}` : "No due date"}
                    </p>
                  </Link>
                ))
              ) : homeworkQuery.error && (isFeatureUnavailableError(homeworkQuery.error) || isNetworkApiError(homeworkQuery.error)) ? (
                <p className="text-sm text-muted-foreground">
                  Homework summaries are still being connected to the backend.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No homework is pending right now.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth activity summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {growthQuery.data?.length ? (
                growthQuery.data.slice(0, 4).map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-2xl border border-border bg-background/80 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <p className="font-medium">{activity.title}</p>
                    </div>
                    <p className="mt-1 text-sm capitalize text-muted-foreground">
                      {activity.activity_type.replaceAll("_", " ")}
                    </p>
                  </div>
                ))
              ) : growthQuery.error && (isFeatureUnavailableError(growthQuery.error) || isNetworkApiError(growthQuery.error)) ? (
                <p className="text-sm text-muted-foreground">
                  Growth summaries are still being connected to the backend.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No growth activities yet. Add one from the Growth page.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent learning events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventsQuery.data?.items.length ? (
                eventsQuery.data.items.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-border bg-background/80 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant="outline">{event.event_type.replaceAll("_", " ")}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(event.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              ) : eventsQuery.data?.source === "fallback" ? (
                <EmptyState
                  title="Learning events are still being connected"
                  description={
                    eventsQuery.data.fallback_message ||
                    "This recent activity feed is still being connected to the backend."
                  }
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Recent events will appear here as the student studies.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
