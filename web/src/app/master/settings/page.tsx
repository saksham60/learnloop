import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export default function MasterSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Platform settings"
        description="Feature toggles, school policy defaults, and health controls will live here."
      />
      <EmptyState
        title="Platform settings are being expanded"
        description="This feature is being connected to the backend."
      />
    </div>
  );
}
