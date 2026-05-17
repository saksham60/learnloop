"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveSchoolChildRequest,
  createParentChildRequest,
  getParentChildRequests,
  getSchoolChildRequests,
  rejectSchoolChildRequest,
} from "@/features/parent-access/api";
import type { CreateChildAccessRequestPayload } from "@/features/parent-access/types";

export function useChildAccessRequests() {
  return useQuery({
    queryKey: ["parent", "child-requests"],
    queryFn: getParentChildRequests,
  });
}

export function useCreateChildAccessRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateChildAccessRequestPayload) => createParentChildRequest(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["parent"] });
    },
  });
}

export function useSchoolChildAccessRequests() {
  return useQuery({
    queryKey: ["school", "child-requests"],
    queryFn: getSchoolChildRequests,
  });
}

export function useApproveSchoolChildRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, studentId }: { requestId: string; studentId?: string | null }) =>
      approveSchoolChildRequest(requestId, studentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["school"] });
      void queryClient.invalidateQueries({ queryKey: ["parent"] });
    },
  });
}

export function useRejectSchoolChildRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason?: string | null }) =>
      rejectSchoolChildRequest(requestId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["school"] });
      void queryClient.invalidateQueries({ queryKey: ["parent"] });
    },
  });
}
