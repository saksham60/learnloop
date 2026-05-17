"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentProfile } from "@/features/auth/hooks/useCurrentProfile";
import {
  useChildAccessRequests,
  useCreateChildAccessRequest,
} from "@/features/parent-access/hooks/useChildAccessRequests";
import type { ChildAccessRequest, ParentRelationship } from "@/features/parent-access/types";
import { isFeatureUnavailableError } from "@/lib/api/errors";
import { formatRelativeTime } from "@/lib/utils";

function getLatestRequest(requests: ChildAccessRequest[]) {
  return [...requests].sort((left, right) => right.created_at.localeCompare(left.created_at))[0] ?? null;
}

export function ParentChildRequestsWorkspace() {
  const profileQuery = useCurrentProfile();
  const requestsQuery = useChildAccessRequests();
  const createMutation = useCreateChildAccessRequest();
  const [childName, setChildName] = useState("");
  const [childEmail, setChildEmail] = useState("");
  const [childClass, setChildClass] = useState("");
  const [childSection, setChildSection] = useState("");
  const [relationship, setRelationship] = useState<ParentRelationship>("guardian");
  const [message, setMessage] = useState("");

  const latestRequest = useMemo(
    () => getLatestRequest(requestsQuery.data ?? []),
    [requestsQuery.data],
  );

  async function handleSubmit() {
    if (!profileQuery.data?.school_id) {
      toast.error("Select a school before requesting child access.");
      return;
    }
    if (!childName.trim() || !childClass.trim()) {
      toast.error("Add your child's name and class before submitting.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        school_id: profileQuery.data.school_id,
        child_name: childName.trim(),
        child_email: childEmail.trim() || null,
        child_class: childClass.trim(),
        child_section: childSection.trim() || null,
        relationship,
        message: message.trim() || null,
      });
      setChildName("");
      setChildEmail("");
      setChildClass("");
      setChildSection("");
      setRelationship("guardian");
      setMessage("");
      toast.success("Child access request submitted to the school.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit the child access request.");
    }
  }

  if (profileQuery.isLoading || requestsQuery.isLoading) {
    return (
      <LoadingState
        title="Loading child access requests"
        description="Preparing the parent request flow for your selected school."
      />
    );
  }

  if (requestsQuery.error) {
    if (isFeatureUnavailableError(requestsQuery.error)) {
      return (
        <div className="space-y-6">
          <PageHeader
            eyebrow="Parent"
            title="Request access to your child's progress"
            description="Submit your child details. The school will review and approve the link."
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
        description="Try again. If the issue persists, the parent request service may still be warming up."
        onRetry={() => void requestsQuery.refetch()}
      />
    );
  }

  const canSubmitNewRequest = !latestRequest || latestRequest.status === "rejected";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parent"
        title="Request access to your child's progress"
        description="Submit your child details. The school will review and approve the link."
      />

      {latestRequest ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Request submitted to school</CardTitle>
                <CardDescription>
                  {latestRequest.school_name || profileQuery.data?.school_name || "Selected school"} |{" "}
                  {formatRelativeTime(latestRequest.created_at)}
                </CardDescription>
              </div>
              <StatusBadge status={latestRequest.status} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-sm font-medium text-foreground">{latestRequest.child_name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {[latestRequest.child_class, latestRequest.child_section].filter(Boolean).join(" | ") || "Class pending"}
              </p>
              <p className="mt-3 text-sm text-muted-foreground capitalize">
                Relationship: {latestRequest.relationship}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-sm font-medium text-foreground">Current status</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {latestRequest.status === "pending_approval"
                  ? "The school is reviewing this request. Your parent account is active, but child access is still waiting for approval."
                  : latestRequest.status === "approved"
                    ? "This request was approved. Your linked child summary will appear in the parent dashboard."
                    : latestRequest.rejection_reason || "This request was not approved. You can submit another request with corrected details."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {canSubmitNewRequest ? (
        <Card>
          <CardHeader>
            <CardTitle>Submit child details</CardTitle>
            <CardDescription>
              {profileQuery.data?.school_name
                ? `${profileQuery.data.school_name} will review this request before parent-child access is linked.`
                : "The selected school will review this request before parent-child access is linked."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="child-name">Child full name</Label>
              <Input
                id="child-name"
                value={childName}
                onChange={(event) => setChildName(event.target.value)}
                placeholder="Aarav Sharma"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-email">Child email</Label>
              <Input
                id="child-email"
                value={childEmail}
                onChange={(event) => setChildEmail(event.target.value)}
                placeholder="Optional child email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-class">Child class or grade</Label>
              <Input
                id="child-class"
                value={childClass}
                onChange={(event) => setChildClass(event.target.value)}
                placeholder="Class 7A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-section">Child section</Label>
              <Input
                id="child-section"
                value={childSection}
                onChange={(event) => setChildSection(event.target.value)}
                placeholder="Optional section"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <select
                id="relationship"
                value={relationship}
                onChange={(event) => setRelationship(event.target.value as ParentRelationship)}
                className="flex h-11 w-full rounded-2xl border border-input bg-white px-4 py-2 text-sm"
              >
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="message">Message to school</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Optional context to help the school verify the child link."
                className="min-h-[120px]"
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                Submit Child Access Request
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : latestRequest?.status === "approved" ? (
        <EmptyState
          title="Child access is approved"
          description="Return to the parent dashboard to view the linked child summary."
        />
      ) : null}
    </div>
  );
}
