import type { ApprovalStatus } from "@/lib/constants";

export type PublicOnboardingRole = "student" | "parent";
export type PublicRegistrationChoice = PublicOnboardingRole | "school";

export type ParentRequest = {
  child_name?: string | null;
  child_email?: string | null;
  child_class?: string | null;
  relationship?: string | null;
};

export type OnboardingPayload = {
  role: PublicOnboardingRole;
  school_id: string;
  approval_status: ApprovalStatus;
  class_grade?: string | null;
  section?: string | null;
};
