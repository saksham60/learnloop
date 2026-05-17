import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export default function SchoolSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="School"
        title="School settings"
        description="School settings and activation controls will expand here as the backend setup flow matures."
      />
      <EmptyState
        title="Settings are intentionally lightweight for now"
        description="School setup, staff management, and deeper configuration will continue to build on this portal."
      />
    </div>
  );
}
