import type { ApprovalStatus } from "@/lib/constants";
import type { School } from "@/features/schools/types";

export type MasterOverview = {
  total_schools: number;
  active_schools: number;
  total_users: number;
  pending_school_admin_setup: number;
  platform_health: string;
};

export type MasterSchool = School & {
  contact_email?: string | null;
  created_at: string;
  user_count: number;
  class_count: number;
};

export type MasterUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  approval_status: ApprovalStatus;
  school_id?: string | null;
  school_name?: string | null;
  created_at: string;
};

export type SchoolAdminAssignment = {
  id: string;
  full_name?: string;
  email: string;
  school_id?: string | null;
  school_name?: string | null;
  approval_status: ApprovalStatus;
};
