import { PageHeader } from "@/components/common/PageHeader";
import { SchoolRegistrationForm } from "@/features/onboarding/components/SchoolRegistrationForm";

export default function SchoolRegistrationPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 md:px-6">
      <PageHeader
        eyebrow="School registration"
        title="Set up LearnLoop for your school"
        description="Share the school details and a LearnLoop team member will review the registration before activation."
      />
      <SchoolRegistrationForm />
    </div>
  );
}
