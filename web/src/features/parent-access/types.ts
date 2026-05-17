export type ParentRelationship = "father" | "mother" | "guardian" | "other";

export type ChildAccessRequestStatus = "pending_approval" | "approved" | "rejected";

export type ChildAccessRequest = {
  id: string;
  parent_id: string;
  parent_name?: string | null;
  parent_email?: string | null;
  school_id: string;
  school_name?: string | null;
  child_name: string;
  child_email?: string | null;
  child_class?: string | null;
  child_section?: string | null;
  relationship: ParentRelationship;
  message?: string | null;
  status: ChildAccessRequestStatus;
  rejection_reason?: string | null;
  created_at: string;
};

export type CreateChildAccessRequestPayload = {
  school_id: string;
  child_name: string;
  child_email?: string | null;
  child_class?: string | null;
  child_section?: string | null;
  relationship: ParentRelationship;
  message?: string | null;
};
