import { apiRequest } from "@/lib/api/client";

import type {
  ContentChunk,
  ContentProcessPayload,
  ContentProcessResult,
  ContentUpload,
  ContentUploadPayload,
} from "./types";

export async function registerContentUpload(payload: ContentUploadPayload) {
  const response = await apiRequest<ContentUpload>("/api/v1/content/upload", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function listContent() {
  const response = await apiRequest<ContentUpload[]>("/api/v1/content", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function processContent(contentId: string, payload: ContentProcessPayload) {
  const response = await apiRequest<ContentProcessResult>(`/api/v1/content/${contentId}/process`, {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getContentChunks(contentId: string) {
  const response = await apiRequest<ContentChunk[]>(`/api/v1/content/${contentId}/chunks`, {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}
