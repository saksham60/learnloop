"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useApproveSchoolRequest,
  useRejectSchoolRequest,
  useSchoolAdminApprovals,
} from "@/features/school-admin/hooks/useSchoolAdmin";
import type { ApprovalRequest } from "@/features/school-admin/types";
import { isFeatureUnavailableError } from "@/lib/api/errors";

function formatRequestedDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function filterRequests(requests: ApprovalRequest[], tab: string) {
  if (tab === "teachers") return requests.filter((item) => item.requested_role === "teacher");
  if (tab === "parents") return requests.filter((item) => item.requested_role === "parent");
  if (tab === "rejected") return requests.filter((item) => item.status === "rejected");
  return requests.filter((item) => item.status === "pending_approval");
}

function ApprovalCard({
  request,
  onApprove,
  onReject,
}: {
  request: ApprovalRequest;
  onApprove: (request: ApprovalRequest) => void;
  onReject: (request: ApprovalRequest) => void;
}) {
  return (
    <Card className="rounded-[1.5rem]">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">{request.full_name}</CardTitle>
            <CardDescription>{request.email}</CardDescription>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="font-medium text-foreground">Requested role</p>
            <p className="capitalize">{request.requested_role.replaceAll("_", " ")}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Requested school</p>
            <p>{request.school_name}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Requested at</p>
            <p>{formatRequestedDate(request.created_at)}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Request status</p>
            <p className="capitalize">{request.status.replaceAll("_", " ")}</p>
          </div>
        </div>
        {request.parent_request ? (
          <div className="rounded-2xl border border-border bg-background/70 p-3">
            <p className="font-medium text-foreground">Parent request details</p>
            <p className="mt-2">Child: {request.parent_request.child_name || "Not provided"}</p>
            <p>Child email: {request.parent_request.child_email || "Not provided"}</p>
            <p>Child class: {request.parent_request.child_class || "Not provided"}</p>
            <p>Relationship: {request.parent_request.relationship || "Not provided"}</p>
          </div>
        ) : null}
        {request.reason ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900">
            <p className="font-medium">Reason</p>
            <p className="mt-1 text-sm">{request.reason}</p>
          </div>
        ) : null}
        {request.status === "pending_approval" ? (
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => onApprove(request)}>
              {request.requested_role === "teacher" ? "Approve Teacher" : "Approve Parent"}
            </Button>
            <Button variant="outline" onClick={() => onReject(request)}>
              Reject
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ApprovalQueue() {
  const [tab, setTab] = useState("all");
  const approvalsQuery = useSchoolAdminApprovals();
  const approveMutation = useApproveSchoolRequest();
  const rejectMutation = useRejectSchoolRequest();

  const requests = useMemo(() => approvalsQuery.data ?? [], [approvalsQuery.data]);

  async function handleApprove(request: ApprovalRequest) {
    try {
      await approveMutation.mutateAsync({
        requestId: request.id,
        role: request.requested_role,
      });
      toast.success(`${request.requested_role === "teacher" ? "Teacher" : "Parent"} approved.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not approve request.");
    }
  }

  async function handleReject(request: ApprovalRequest) {
    const reason =
      window.prompt("Reason for rejection?", "Please contact the school admin for details.") || undefined;
    try {
      await rejectMutation.mutateAsync({ requestId: request.id, reason });
      toast.success("Request rejected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reject request.");
    }
  }

  if (approvalsQuery.isLoading) {
    return (
      <LoadingState
        title="Loading approvals"
        description="Preparing teacher and parent access requests for review."
      />
    );
  }

  if (approvalsQuery.error) {
    if (isFeatureUnavailableError(approvalsQuery.error)) {
      return (
        <EmptyState
          title="Approval queue is being connected"
          description="This feature is being connected to the backend."
        />
      );
    }

    return (
      <ErrorState
        title="We could not load approval requests"
        description="Try again. If the issue persists, the backend may still be warming up."
        onRetry={() => void approvalsQuery.refetch()}
      />
    );
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">All Pending</TabsTrigger>
        <TabsTrigger value="teachers">Teachers</TabsTrigger>
        <TabsTrigger value="parents">Parents</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>
      {["all", "teachers", "parents", "rejected"].map((key) => {
        const items = filterRequests(requests, key);
        return (
          <TabsContent key={key} value={key} className="space-y-4">
            {items.length ? (
              items.map((request) => (
                <ApprovalCard
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            ) : (
              <EmptyState
                title="No approval requests here"
                description="This section is clear right now."
              />
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
