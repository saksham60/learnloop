export type School = {
  id: string;
  name: string;
  code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  status: "active" | "inactive";
};
