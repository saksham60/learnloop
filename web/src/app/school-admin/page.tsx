import { PageHeader } from "@/components/common/PageHeader";
import { OverviewCards } from "@/features/school-admin/components/OverviewCards";

export default function SchoolAdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="School admin"
        title="School operations overview"
        description="Track approvals, class structure, teacher coverage, and parent relationships from one place."
      />
      <OverviewCards />
    </div>
  );
}
