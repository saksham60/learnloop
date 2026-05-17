"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getContentChunks,
  listContent,
  processContent,
  registerContentUpload,
} from "@/features/content/api";

export function useContentList() {
  return useQuery({
    queryKey: ["content", "list"],
    queryFn: listContent,
  });
}

export function useRegisterContentUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerContentUpload,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["content", "list"] });
    },
  });
}

export function useProcessContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contentId, rawText }: { contentId: string; rawText?: string | null }) =>
      processContent(contentId, { raw_text: rawText }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["content", "list"] });
    },
  });
}

export function useContentChunks(contentId?: string | null) {
  return useQuery({
    queryKey: ["content", "chunks", contentId],
    queryFn: () => getContentChunks(contentId as string),
    enabled: Boolean(contentId),
  });
}
