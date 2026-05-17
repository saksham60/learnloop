import type { AppRole, ApprovalStatus } from "@/lib/constants";

export type UserRole = AppRole;

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  approval_status: ApprovalStatus;
  school_id?: string | null;
  school_name?: string | null;
  grade_level?: string | null;
  avatar_url?: string | null;
  approval_reason?: string | null;
  parent_request?: {
    child_name?: string | null;
    child_email?: string | null;
    child_class?: string | null;
    relationship?: string | null;
  } | null;
  created_at: string;
};

export type ProfilePayload = {
  full_name: string;
  role: UserRole;
  approval_status: ApprovalStatus;
  school_id?: string | null;
  grade_level?: string | null;
  avatar_url?: string | null;
  approval_reason?: string | null;
  parent_request?: {
    child_name?: string | null;
    child_email?: string | null;
    child_class?: string | null;
    relationship?: string | null;
  } | null;
};
