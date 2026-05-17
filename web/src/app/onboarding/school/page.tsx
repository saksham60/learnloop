import { redirect } from "next/navigation";

import { PageHeader } from "@/components/common/PageHeader";
import { SchoolSelectionForm } from "@/features/onboarding/components/SchoolSelectionForm";
import type { PublicOnboardingRole } from "@/features/onboarding/types";

const allowedRoles: PublicOnboardingRole[] = ["student", "parent"];

function resolveRole(value: string | string[] | undefined): PublicOnboardingRole | null {
  const role = Array.isArray(value) ? value[0] : value;
  return role && allowedRoles.includes(role as PublicOnboardingRole)
    ? (role as PublicOnboardingRole)
    : null;
}

export default async function OnboardingSchoolPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const role = resolveRole(params.role);

  if (!role) {
    redirect("/onboarding/role");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 md:px-6">
      <PageHeader
        eyebrow="School selection"
        title="Choose your school"
        description="Search for your school, confirm the right organization, and continue with the correct LearnLoop access path."
      />
      <SchoolSelectionForm role={role} />
    </div>
  );
}
