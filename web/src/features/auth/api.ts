import { apiRequest } from "@/lib/api/client";
import { ApiError, FeatureUnavailableError, isFeatureUnavailableError } from "@/lib/api/errors";

import type { ProfilePayload, UserProfile } from "./types";

export class ProfileMissingError extends ApiError {
  constructor(message = "No LearnLoop profile exists for this account yet.", payload?: unknown) {
    super(message, 401, payload, "profile_missing");
    this.name = "ProfileMissingError";
  }
}

export function isProfileMissingError(error: unknown): error is ProfileMissingError {
  return error instanceof ProfileMissingError;
}

function looksLikeMissingProfile(error: unknown) {
  return (
    error instanceof ApiError &&
    error.status === 401 &&
    error.code === "authentication_error" &&
    error.message.includes("No user profile exists for this Supabase account.")
  );
}

export async function fetchCurrentProfile() {
  try {
    const response = await apiRequest<UserProfile>("/api/v1/auth/me", {
      treat404AsUnavailable: true,
    });
    return response.data;
  } catch (error) {
    if (looksLikeMissingProfile(error)) {
      throw new ProfileMissingError(undefined, error instanceof ApiError ? error.payload : error);
    }
    throw error;
  }
}

export async function upsertProfile(payload: ProfilePayload) {
  try {
    const response = await apiRequest<UserProfile>("/api/v1/auth/profile", {
      method: "POST",
      body: payload,
      treat404AsUnavailable: true,
    });
    return response.data;
  } catch (error) {
    if (isFeatureUnavailableError(error)) {
      throw new FeatureUnavailableError(
        "Profile creation is being connected to the backend.",
        error.status,
        error.payload,
      );
    }
    throw error;
  }
}
