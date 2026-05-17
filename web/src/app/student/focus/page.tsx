import { PageHeader } from "@/components/common/PageHeader";
import { LearningCompass } from "@/features/focus/components/LearningCompass";

export default function StudentFocusPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learning Compass"
        title="Today’s focus"
        description="A structured focus board built from learning events, hints, attempts, and missed practice."
      />
      <LearningCompass />
    </div>
  );
}
