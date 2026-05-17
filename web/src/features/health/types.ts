export type BackendHealthPayload = {
  status: string;
  service: string;
};

export type BackendHealthState = BackendHealthPayload & {
  source: "backend" | "fallback";
  message?: string;
};
