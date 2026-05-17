"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { PeopleTable } from "@/features/school-admin/components/PeopleTable";
import { useSchoolParents } from "@/features/school-admin/hooks/useSchoolAdmin";

export default function SchoolAdminParentsPage() {
  const parentsQuery = useSchoolParents();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parents"
        title="Parent roster"
        description="Track approved parent accounts and how many students are linked to each one."
      />
      <PeopleTable
        title="Parents"
        description="Parent relationship coverage for this school."
        rows={(parentsQuery.data ?? []) as unknown as Record<string, unknown>[]}
        isLoading={parentsQuery.isLoading}
        error={parentsQuery.error}
        onRetry={() => void parentsQuery.refetch()}
        loadingTitle="Loading parents"
        loadingDescription="Preparing the parent roster for this school."
        unavailableTitle="Parent roster is being connected"
        unavailableDescription="This feature is being connected to the backend."
        columns={[
          { key: "full_name", label: "Parent" },
          { key: "email", label: "Email" },
          { key: "linked_students_count", label: "Linked students" },
          { key: "status", label: "Status" },
        ]}
      />
    </div>
  );
}
