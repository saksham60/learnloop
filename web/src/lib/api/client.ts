"use client";

import { API_BASE_URL } from "@/lib/constants";
import { ApiError, FeatureUnavailableError } from "@/lib/api/errors";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type ApiEnvelope<T> = {
  data: T | null;
  message: string;
  meta: Record<string, unknown>;
};

type BackendErrorPayload = {
  error?: {
    code?: string;
    detail?: string;
    meta?: Record<string, unknown>;
  };
};

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
  treat404AsUnavailable?: boolean;
};

function buildUrl(path: string, query?: ApiRequestOptions["query"]) {
  const url = new URL(path, API_BASE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function getAccessToken() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const token = options.auth === false ? null : await getAccessToken();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    throw new ApiError(
      "LearnLoop AI could not reach the backend right now.",
      0,
      error,
      "network_error",
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as ApiEnvelope<T> | BackendErrorPayload)
    : null;

  if (!response.ok) {
    if (response.status === 501 || (response.status === 404 && options.treat404AsUnavailable)) {
      throw new FeatureUnavailableError(
        "This feature is being connected to the backend.",
        response.status,
        payload,
      );
    }

    const errorPayload = (payload as BackendErrorPayload | null)?.error;
    const message =
      errorPayload?.detail ||
      (payload as ApiEnvelope<T> | null)?.message ||
      "Something went wrong while talking to LearnLoop AI.";

    throw new ApiError(message, response.status, payload, errorPayload?.code, errorPayload?.meta);
  }

  return (payload as ApiEnvelope<T>) || { data: null, message: "ok", meta: {} };
}
