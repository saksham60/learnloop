"use client";

import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAssignSchoolAdmin, useSchoolAdmins } from "@/features/master-admin/hooks/useMasterAdmin";
import { useSchools } from "@/features/schools/hooks/useSchools";
import { isFeatureUnavailableError } from "@/lib/api/errors";

export function SchoolAdminAssignmentPanel() {
  const [email, setEmail] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const schoolsQuery = useSchools();
  const adminsQuery = useSchoolAdmins();
  const assignMutation = useAssignSchoolAdmin();

  async function handleAssign() {
    if (!email.trim() || !schoolId) return;
    try {
      await assignMutation.mutateAsync({ email: email.trim(), school_id: schoolId });
      setEmail("");
      toast.success("School admin assigned.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not assign school admin.");
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Assign school admin</CardTitle>
          <CardDescription>Only platform admins can grant school admin access.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="school-admin-email">User email</Label>
            <Input
              id="school-admin-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@school.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school-admin-school">School</Label>
            <select
              id="school-admin-school"
              value={schoolId}
              onChange={(event) => setSchoolId(event.target.value)}
              className="flex h-11 w-full rounded-2xl border border-input bg-white px-4 py-2 text-sm"
              disabled={schoolsQuery.isLoading || !!schoolsQuery.error}
            >
              <option value="">Select school</option>
              {(schoolsQuery.data ?? []).map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Button onClick={handleAssign} disabled={assignMutation.isPending || schoolsQuery.isLoading}>
              Assign role = school_admin
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current school admins</CardTitle>
          <CardDescription>Review who currently manages each school.</CardDescription>
        </CardHeader>
        <CardContent>
          {adminsQuery.isLoading ? (
            <LoadingState
              title="Loading school admins"
              description="Preparing school admin assignments across the platform."
            />
          ) : adminsQuery.error ? (
            isFeatureUnavailableError(adminsQuery.error) ? (
              <EmptyState
                title="School admin list is being connected"
                description="This feature is being connected to the backend."
              />
            ) : (
              <ErrorState
                title="We could not load school admins"
                description="Try again. If the issue persists, the backend may still be warming up."
                onRetry={() => void adminsQuery.refetch()}
              />
            )
          ) : adminsQuery.data?.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {adminsQuery.data.map((admin) => (
                <div key={admin.id} className="rounded-[1.5rem] border border-border bg-background/70 p-4">
                  <p className="font-medium text-foreground">{admin.email}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {admin.school_name || "No school assigned"}
                  </p>
                  <div className="mt-3">
                    <StatusBadge status={admin.approval_status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No school admins assigned yet"
              description="Assign a school admin after creating the school."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
