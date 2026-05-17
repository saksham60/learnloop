import type { ApprovalStatus } from "@/lib/constants";

export type PublicOnboardingRole = "student" | "teacher" | "parent";

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
  grade_level?: string | null;
  parent_request?: ParentRequest | null;
};
