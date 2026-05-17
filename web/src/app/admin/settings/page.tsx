import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Organization settings"
        description="Feature toggles, school-level preferences, and governance controls can plug into this route later."
      />
      <EmptyState
        title="Settings are waiting for backend support"
        description="This page is reserved for school configuration, feature controls, and future governance tools."
      />
    </div>
  );
}
