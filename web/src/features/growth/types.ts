export type GrowthActivity = {
  id: string;
  title: string;
  activity_type: string;
  status: string;
};

export type GrowthActivityPayload = {
  activity_type: string;
  title: string;
  description?: string | null;
};

export type GrowthActivityResult = {
  id: string;
  title?: string;
  status: string;
};
