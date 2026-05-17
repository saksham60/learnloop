import type { AppRole } from "@/lib/constants";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  school_id?: string | null;
  grade_level?: string | null;
  avatar_url?: string | null;
};

export type ProfilePayload = {
  full_name: string;
  role: AppRole;
  school_id?: string | null;
  grade_level?: string | null;
  avatar_url?: string | null;
};

