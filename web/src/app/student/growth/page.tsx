import { PageHeader } from "@/components/common/PageHeader";
import { GrowthDashboard } from "@/features/growth/components/GrowthDashboard";

export default function StudentGrowthPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Growth"
        title="Skills beyond classwork"
        description="Sports, mobility, communication, coding, creativity, and daily habits live alongside your study plan."
      />
      <GrowthDashboard />
    </div>
  );
}
