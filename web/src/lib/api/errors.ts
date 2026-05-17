export class ApiError extends Error {
  status: number;
  payload?: unknown;
  code?: string;
  meta?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    payload?: unknown,
    code?: string,
    meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.code = code;
    this.meta = meta;
  }
}

export class FeatureUnavailableError extends ApiError {
  constructor(
    message = "This feature is being connected to the backend.",
    status = 404,
    payload?: unknown,
  ) {
    super(message, status, payload, "feature_unavailable");
    this.name = "FeatureUnavailableError";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isFeatureUnavailableError(error: unknown): error is FeatureUnavailableError {
  return error instanceof FeatureUnavailableError;
}

export function isApiErrorCode(error: unknown, code: string) {
  return error instanceof ApiError && error.code === code;
}

export function isNetworkApiError(error: unknown) {
  return error instanceof ApiError && error.code === "network_error";
}
