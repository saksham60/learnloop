"use client";

import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useApproveSchoolChildRequest,
  useRejectSchoolChildRequest,
  useSchoolChildAccessRequests,
} from "@/features/parent-access/hooks/useChildAccessRequests";
import { isFeatureUnavailableError } from "@/lib/api/errors";
import { formatRelativeTime } from "@/lib/utils";

export function SchoolChildRequestsWorkspace() {
  const requestsQuery = useSchoolChildAccessRequests();
  const approveMutation = useApproveSchoolChildRequest();
  const rejectMutation = useRejectSchoolChildRequest();

  async function handleApprove(requestId: string) {
    try {
      await approveMutation.mutateAsync({ requestId });
      toast.success("Child access request approved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not approve the child access request.");
    }
  }

  async function handleReject(requestId: string) {
    const reason = window.prompt("Add an optional rejection reason for the parent.");
    if (reason === null) return;

    try {
      await rejectMutation.mutateAsync({ requestId, reason: reason.trim() || null });
      toast.success("Child access request rejected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reject the child access request.");
    }
  }

  if (requestsQuery.isLoading) {
    return (
      <LoadingState
        title="Loading child access requests"
        description="Preparing parent-child approval items for this school."
      />
    );
  }

  if (requestsQuery.error) {
    if (isFeatureUnavailableError(requestsQuery.error)) {
      return (
        <div className="space-y-6">
          <PageHeader
            eyebrow="School"
            title="Review parent-child access requests"
            description="Approve or reject link requests raised by active parent accounts."
          />
          <EmptyState
            title="Child access approval is being connected"
            description="This feature is being connected to the backend."
          />
        </div>
      );
    }

    return (
      <ErrorState
        title="We could not load child access requests"
        description="Try again. If the issue persists, the school approval service may still be warming up."
        onRetry={() => void requestsQuery.refetch()}
      />
    );
  }

  const requests = requestsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="School"
        title="Review parent-child access requests"
        description="Approve or reject link requests raised by active parent accounts."
      />

      {requests.length ? (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>{request.parent_name || "Parent request"}</CardTitle>
                    <CardDescription>
                      {request.parent_email || "Email unavailable"} | Submitted {formatRelativeTime(request.created_at)}
                    </CardDescription>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <p className="text-sm font-medium text-foreground">Child details</p>
                    <p className="mt-2 text-sm text-muted-foreground">{request.child_name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[request.child_class, request.child_section].filter(Boolean).join(" | ") || "Class not provided"}
                    </p>
                    {request.child_email ? (
                      <p className="mt-1 text-sm text-muted-foreground">{request.child_email}</p>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <p className="text-sm font-medium text-foreground">Relationship and note</p>
                    <p className="mt-2 text-sm capitalize text-muted-foreground">{request.relationship}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {request.message || "No message was included with this request."}
                    </p>
                    {request.rejection_reason ? (
                      <p className="mt-2 text-sm text-destructive">{request.rejection_reason}</p>
                    ) : null}
                  </div>
                </div>

                {request.status === "pending_approval" ? (
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => void handleApprove(request.id)} disabled={approveMutation.isPending}>
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void handleReject(request.id)}
                      disabled={rejectMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No child access requests yet"
          description="When parents request access to a child, the school can review and action those links here."
        />
      )}
    </div>
  );
}
