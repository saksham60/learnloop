export type School = {
  id: string;
  name: string;
  code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  status: "active" | "inactive";
};

export type SchoolRegistrationRequest = {
  id?: string;
  school_name: string;
  school_code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  contact_email: string;
  contact_person_name: string;
  contact_phone?: string | null;
  message?: string | null;
  status?: "pending_review" | "approved" | "rejected";
};
