"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, Flag, HeartHandshake, MessageSquareQuote, Users } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useChildAccessRequests } from "@/features/parent-access/hooks/useChildAccessRequests";
import { useParentDashboard } from "@/features/parent-dashboard/hooks/useParentDashboard";
import { isFeatureUnavailableError } from "@/lib/api/errors";
import { formatRelativeTime } from "@/lib/utils";

export function ParentDashboardView() {
  const router = useRouter();
  const dashboardQuery = useParentDashboard();
  const requestsQuery = useChildAccessRequests();

  const latestRequest = useMemo(() => {
    const requests = requestsQuery.data ?? [];
    return [...requests].sort((left, right) => right.created_at.localeCompare(left.created_at))[0] ?? null;
  }, [requestsQuery.data]);

  const totals = useMemo(() => {
    const data = dashboardQuery.data;
    if (!data) {
      return {
        children: 0,
        homework: 0,
        focus: 0,
        teachers: 0,
      };
    }

    const teacherIds = new Set(
      data.children.flatMap((child) => child.linked_teachers.map((teacher) => teacher.id)),
    );

    return {
      children: data.children.length,
      homework: data.children.reduce((sum, child) => sum + child.pending_homework_count, 0),
      focus: data.children.reduce((sum, child) => sum + child.active_focus_count, 0),
      teachers: teacherIds.size,
    };
  }, [dashboardQuery.data]);

  if (dashboardQuery.isLoading && requestsQuery.isLoading) {
    return (
      <LoadingState
        title="Loading parent dashboard"
        description="Preparing linked student progress, homework summaries, and teacher context."
      />
    );
  }

  if (requestsQuery.error) {
    if (isFeatureUnavailableError(requestsQuery.error)) {
      return (
        <div className="space-y-6">
          <PageHeader
            eyebrow="Parent"
            title="Follow your child's learning journey"
            description="This school-approved parent view will show linked children, request status, homework summaries, and teacher notes."
          />
          <EmptyState
            title="Parent dashboard is being connected"
            description="Once the parent request endpoints are live, this area will show request status and linked child summaries."
          />
        </div>
      );
    }

    return (
      <ErrorState
        title="We could not load parent access status"
        description="Try again. If the issue persists, the parent request service may still be warming up."
        onRetry={() => void requestsQuery.refetch()}
      />
    );
  }

  if (dashboardQuery.error && !isFeatureUnavailableError(dashboardQuery.error)) {
    return (
      <ErrorState
        title="We could not load the parent dashboard"
        description="Try again. If the issue persists, the parent summary service may still be warming up."
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  }

  const dashboard = dashboardQuery.data;
  const firstChildName = dashboard?.children[0]?.full_name?.split(" ")[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parent"
        title={
          firstChildName
            ? `Stay close to ${firstChildName}'s learning rhythm`
            : "Follow your child's learning journey"
        }
        description="This view is intentionally concise: what your child is working on, where gentle support helps most, and what their teachers want reinforced at home."
        action={<Badge variant="outline">School-approved view</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Linked children"
          value={totals.children}
          detail="Students approved for this parent account"
          icon={HeartHandshake}
          tone="success"
        />
        <StatCard
          title="Pending homework"
          value={totals.homework}
          detail="Assignments still open across linked children"
          icon={BookOpenCheck}
          tone="warning"
        />
        <StatCard
          title="Active focus areas"
          value={totals.focus}
          detail="Signals where gentle practice can help"
          icon={Flag}
        />
        <StatCard
          title="Teacher touchpoints"
          value={totals.teachers}
          detail="Teachers currently connected to your child"
          icon={Users}
        />
      </div>

      {dashboard?.children.length ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Linked children</CardTitle>
                <CardDescription>Each card shows the immediate context you can act on at home.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboard.children.map((child) => (
                  <div
                    key={child.id}
                    className="rounded-[1.75rem] border border-primary/10 bg-gradient-to-br from-white via-white to-primary/5 p-5 shadow-soft"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold tracking-tight text-foreground">
                            {child.full_name}
                          </h3>
                          {child.relationship ? (
                            <Badge variant="outline" className="capitalize">
                              {child.relationship}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {child.class_name || "Class pending"}{child.school_name ? ` | ${child.school_name}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{child.pending_homework_count} homework open</Badge>
                        <Badge variant="outline">{child.active_focus_count} focus signals</Badge>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr,1.05fr]">
                      <div className="space-y-3 rounded-2xl border border-border/80 bg-white/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                          Next at home
                        </p>
                        <p className="text-sm leading-6 text-foreground">{child.support_tip}</p>
                        {child.next_homework ? (
                          <div className="rounded-2xl bg-secondary/70 p-3">
                            <p className="font-medium text-foreground">{child.next_homework.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {child.next_homework.due_at
                                ? `Due ${formatRelativeTime(child.next_homework.due_at)}`
                                : "No due date set"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No pending homework right now.
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 rounded-2xl border border-border/80 bg-white/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                          Linked teachers
                        </p>
                        {child.linked_teachers.length ? (
                          <div className="flex flex-wrap gap-2">
                            {child.linked_teachers.map((teacher) => (
                              <div
                                key={`${child.id}-${teacher.id}`}
                                className="rounded-2xl border border-border bg-background px-3 py-2"
                              >
                                <p className="text-sm font-medium text-foreground">{teacher.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {[teacher.subject_name, teacher.class_name].filter(Boolean).join(" | ")}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Teacher links will appear here once they are assigned by the school admin.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current focus areas</CardTitle>
                <CardDescription>These are the signals worth reinforcing gently at home.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {dashboard.children.flatMap((child) =>
                  child.focus_areas.slice(0, 2).map((item) => (
                    <div
                      key={`${child.id}-${item.id}`}
                      className="rounded-[1.5rem] border border-border bg-background/80 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <Badge variant="outline">{item.score.toFixed(1)}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description || "This area needs a little more consistent practice."}
                      </p>
                    </div>
                  )),
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Homework summary</CardTitle>
                <CardDescription>What is due next across the children linked to this account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.children.some((child) => child.next_homework) ? (
                  dashboard.children
                    .filter((child) => child.next_homework)
                    .map((child) => (
                      <div
                        key={`${child.id}-homework`}
                        className="rounded-2xl border border-border bg-background/80 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{child.next_homework?.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{child.full_name}</p>
                          </div>
                          <Badge variant="outline">{child.next_homework?.question_count ?? 0} questions</Badge>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {child.next_homework?.description || "No description yet."}
                        </p>
                      </div>
                    ))
                ) : (
                  <EmptyState
                    title="No homework is open right now"
                    description="Once teachers assign or reopen work, it will surface here in a safe parent summary."
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Teacher notes</CardTitle>
                <CardDescription>Short, school-safe notes to help you reinforce the right habit at home.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.teacher_notes.length ? (
                  dashboard.teacher_notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-[1.5rem] border border-border bg-background/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{note.teacher_name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {[note.subject_name, note.student_name].filter(Boolean).join(" | ")}
                          </p>
                        </div>
                        <Badge variant="outline">{formatRelativeTime(note.updated_at)}</Badge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-foreground">{note.note}</p>
                      {note.next_step ? (
                        <div className="mt-3 rounded-2xl bg-secondary/70 p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                            Next step
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">{note.next_step}</p>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No teacher notes yet"
                    description="As teacher commentary becomes available, it will be summarized here for parents."
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How you can help today</CardTitle>
                <CardDescription>Low-pressure prompts that support learning without doing the work for them.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.children.map((child) => (
                  <div
                    key={`${child.id}-support`}
                    className="rounded-2xl border border-border bg-background/80 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquareQuote className="h-4 w-4 text-primary" />
                      <p className="font-medium text-foreground">{child.full_name}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{child.support_tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>
                    {latestRequest
                      ? "Child access status"
                      : "No child is linked yet"}
                  </CardTitle>
                  <CardDescription>
                    {latestRequest
                      ? `Most recent request submitted ${formatRelativeTime(latestRequest.created_at)}`
                      : "Submit a child request so the school can review and approve the link."}
                  </CardDescription>
                </div>
                {latestRequest ? <Badge variant="outline">{latestRequest.status}</Badge> : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestRequest ? (
                <>
                  <div className="rounded-[1.5rem] border border-border bg-background/80 p-4">
                    <p className="font-medium text-foreground">{latestRequest.child_name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[latestRequest.child_class, latestRequest.child_section].filter(Boolean).join(" | ") || "Class pending"}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground capitalize">
                      Relationship: {latestRequest.relationship}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border bg-background/80 p-4">
                    <p className="text-sm leading-6 text-muted-foreground">
                      {latestRequest.status === "pending_approval"
                        ? "Parent account is active, but child access is still waiting for school approval."
                        : latestRequest.status === "approved"
                          ? "The school approved this request. Child summary will appear here as linked data comes online."
                          : latestRequest.rejection_reason || "This request was not approved. You can submit another request with corrected details."}
                    </p>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="Request child access"
                  description="Parent account is active, but no child is linked yet. Start with your child's school details."
                  actionLabel="Request Child Access"
                  onAction={() => router.push("/parent/child-requests")}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What happens next</CardTitle>
              <CardDescription>LearnLoop keeps the parent experience active while student access stays school-approved.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <div className="rounded-2xl border border-border bg-background/80 p-4">
                <p className="font-medium text-foreground">1. Parent account is active</p>
                <p className="mt-1">You can access the parent workspace right after selecting the school.</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/80 p-4">
                <p className="font-medium text-foreground">2. School verifies the child link</p>
                <p className="mt-1">The school reviews the request before any student progress is exposed to a parent.</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/80 p-4">
                <p className="font-medium text-foreground">3. Linked child summary appears here</p>
                <p className="mt-1">Once approved, the dashboard shows a calm snapshot of homework, focus areas, and teacher notes.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
