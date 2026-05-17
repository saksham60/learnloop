import { PageHeader } from "@/components/common/PageHeader";
import { AskMyProgress } from "@/features/progress/components/AskMyProgress";
import { ProgressSummary } from "@/features/progress/components/ProgressSummary";
import { WeakTopicList } from "@/features/progress/components/WeakTopicList";

export default function StudentProgressPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Progress"
        title="Ask My Progress"
        description="Ask questions about your own learning without exposing raw data directly to the model."
      />
      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <AskMyProgress />
          <ProgressSummary />
        </div>
        <WeakTopicList />
      </div>
    </div>
  );
}
