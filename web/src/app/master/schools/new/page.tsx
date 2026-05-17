import { PageHeader } from "@/components/common/PageHeader";
import { SchoolManagement } from "@/features/master-admin/components/SchoolManagement";

export default function MasterNewSchoolPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="New school"
        title="Create a school"
        description="Provision a new organization before school admin assignment."
      />
      <SchoolManagement />
    </div>
  );
}
