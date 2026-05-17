import { PageHeader } from "@/components/common/PageHeader";
import { CreateHomeworkForm } from "@/features/homework/components/CreateHomeworkForm";

export default function TeacherHomeworkNewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Create homework"
        title="Build a guided assignment"
        description="Set up a homework flow that keeps hints limited and encourages students to try first."
      />
      <CreateHomeworkForm />
    </div>
  );
}
