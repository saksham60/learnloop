import { PageHeader } from "@/components/common/PageHeader";
import { MasterOverviewCards } from "@/features/master-admin/components/MasterOverviewCards";

export default function MasterPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform admin"
        title="Platform overview"
        description="Provision schools, assign school admins, and monitor platform-level rollout."
      />
      <MasterOverviewCards />
    </div>
  );
}
