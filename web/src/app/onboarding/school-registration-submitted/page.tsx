import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export default function SchoolRegistrationSubmittedPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 md:px-6">
      <PageHeader
        eyebrow="School registration"
        title="Registration submitted"
        description="Your school registration request has been submitted. LearnLoop will review and activate your school account."
      />
      <EmptyState
        title="School setup is under review"
        description="The LearnLoop team will review the school information and follow up before any school-facing workspace is activated."
      />
    </div>
  );
}
