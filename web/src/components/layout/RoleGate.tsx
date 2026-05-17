"use client";

import { type PropsWithChildren, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { isProfileMissingError } from "@/features/auth/api";
import { useCurrentProfile } from "@/features/auth/hooks/useCurrentProfile";
import type { AppRole } from "@/lib/constants";
import { ApiError, isFeatureUnavailableError, isNetworkApiError } from "@/lib/api/errors";
import { evaluateRoleAccess } from "@/features/role-gate/utils";
import { useSupabaseAuth } from "@/providers/SupabaseProvider";

export function RoleGate({
  allowedRoles,
  children,
}: PropsWithChildren<{
  allowedRoles: AppRole[];
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isEnabled, isReady, user } = useSupabaseAuth();
  const profileQuery = useCurrentProfile();
  const profile = profileQuery.data;

  useEffect(() => {
    if (!isEnabled || !isReady) return;

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isProfileMissingError(profileQuery.error)) {
      router.replace(`/auth/callback?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const decision = evaluateRoleAccess(profile, allowedRoles);
    if (decision.kind === "redirect") {
      router.replace(decision.href);
    }
  }, [allowedRoles, isEnabled, isReady, pathname, profile, profileQuery.error, router, user]);

  if (!isEnabled) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          title="Supabase login is not configured"
          description="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to unlock the signed-in LearnLoop experience."
        />
      </div>
    );
  }

  if (!isReady || (!user && isEnabled)) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <LoadingState
          title="Preparing your workspace"
          description="Checking your LearnLoop access and profile."
        />
      </div>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <LoadingState
          title="Loading your workspace"
          description="Fetching your LearnLoop profile and dashboard."
        />
      </div>
    );
  }

  if (profileQuery.error) {
    if (isProfileMissingError(profileQuery.error)) {
      return (
        <div className="mx-auto max-w-5xl px-4 py-10">
          <LoadingState
            title="Setting up your profile"
            description="Redirecting you to LearnLoop onboarding."
          />
        </div>
      );
    }

    if (isFeatureUnavailableError(profileQuery.error) || isNetworkApiError(profileQuery.error)) {
      return (
        <div className="mx-auto max-w-5xl px-4 py-10">
          <EmptyState
            title="Auth profile connection is still warming up"
            description="LearnLoop can sign you in, but the backend auth profile endpoint is still being connected or waking up. Please retry shortly."
            actionLabel="Retry"
            onAction={() => void profileQuery.refetch()}
          />
        </div>
      );
    }

    if (profileQuery.error instanceof ApiError && profileQuery.error.status === 401) {
      return (
        <div className="mx-auto max-w-5xl px-4 py-10">
          <ErrorState
            title="Your session needs to be refreshed"
            description="LearnLoop could not validate the current backend session. Sign in again if this keeps happening."
            onRetry={() => void profileQuery.refetch()}
          />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <ErrorState
          title="We could not load your access profile"
          description="Try again. If this persists, your backend auth profile may still be warming up."
          onRetry={() => profileQuery.refetch()}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <LoadingState
          title="Routing your workspace"
          description="Taking you to the right LearnLoop space."
        />
      </div>
    );
  }

  const decision = evaluateRoleAccess(profile, allowedRoles);
  if (decision.kind === "forbidden") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState
          title="You do not have access to this area"
          description="Your current LearnLoop role does not allow access to this workspace."
        />
      </div>
    );
  }

  if (decision.kind !== "allow") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <LoadingState
          title="Routing your workspace"
          description="Taking you to the right LearnLoop space."
        />
      </div>
    );
  }

  return children;
}
