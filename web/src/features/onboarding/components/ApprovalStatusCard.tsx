"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from "@/features/auth/types";

export function ApprovalStatusCard({
  profile,
  title,
  description,
  onRefresh,
}: {
  profile: UserProfile | null | undefined;
  title: string;
  description: string;
  onRefresh?: () => void;
}) {
  const createdDate = profile?.created_at
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(profile.created_at))
    : "Unknown";

  return (
    <Card className="mx-auto max-w-2xl rounded-[2rem] border-white/70 bg-white/85 shadow-glass">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-sm leading-6">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="grid gap-3 rounded-[1.5rem] border border-border bg-background/70 p-4 sm:grid-cols-2">
          <div>
            <p className="font-medium text-foreground">Requested role</p>
            <p className="capitalize">{profile?.role?.replaceAll("_", " ") || "Pending"}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">School</p>
            <p>{profile?.school_name || "No school selected yet"}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Request status</p>
            <p className="capitalize">{profile?.approval_status?.replaceAll("_", " ") || "Unknown"}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Created</p>
            <p>{createdDate}</p>
          </div>
        </div>
        {profile?.approval_reason ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900">
            <p className="font-medium">Reason</p>
            <p className="mt-1 text-sm">{profile.approval_reason}</p>
          </div>
        ) : null}
        {onRefresh ? (
          <Button variant="outline" onClick={onRefresh}>
            Refresh status
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
