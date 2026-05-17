import { PageHeader } from "@/components/common/PageHeader";
import { SchoolManagement } from "@/features/master-admin/components/SchoolManagement";

export default function MasterSchoolsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Schools"
        title="Create and manage schools"
        description="Manage school rollout, location metadata, and whether each school is active."
      />
      <SchoolManagement />
    </div>
  );
}
