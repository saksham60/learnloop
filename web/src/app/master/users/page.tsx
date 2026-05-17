"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { PeopleTable } from "@/features/school-admin/components/PeopleTable";
import { useMasterUsers } from "@/features/master-admin/hooks/useMasterAdmin";

export default function MasterUsersPage() {
  const usersQuery = useMasterUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Users"
        title="Platform user directory"
        description="Review users across all schools, current roles, and approval state."
      />
      <PeopleTable
        title="All users"
        description="Platform-wide user directory."
        rows={(usersQuery.data ?? []) as unknown as Record<string, unknown>[]}
        isLoading={usersQuery.isLoading}
        error={usersQuery.error}
        onRetry={() => void usersQuery.refetch()}
        loadingTitle="Loading platform users"
        loadingDescription="Preparing the cross-school user directory."
        unavailableTitle="Platform user directory is being connected"
        unavailableDescription="This feature is being connected to the backend."
        columns={[
          { key: "full_name", label: "Name" },
          { key: "email", label: "Email" },
          {
            key: "role",
            label: "Role",
            render: (row) => String(row.role ?? "N/A").replaceAll("_", " "),
          },
          { key: "school_name", label: "School" },
          { key: "approval_status", label: "Status" },
          { key: "created_at", label: "Created" },
        ]}
      />
    </div>
  );
}
