"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { fetchCurrentProfile, isProfileMissingError, upsertProfile } from "@/features/auth/api";
import { type UserProfile } from "@/features/auth/types";
import { isFeatureUnavailableError, isNetworkApiError } from "@/lib/api/errors";
import { roleDestinations } from "@/lib/constants";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/providers/SupabaseProvider";

function buildFallbackProfile(user: NonNullable<ReturnType<typeof useSupabaseAuth>["user"]>) {
  return {
    full_name:
      user.user_metadata.full_name ||
      user.user_metadata.name ||
      user.email?.split("@")[0] ||
      "LearnLoop member",
    role: "pending" as const,
    school_id: null,
    grade_level: null,
    avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture || null,
  };
}

function AuthCallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const code = searchParams.get("code");
  const authError = searchParams.get("error");
  const authErrorDescription = searchParams.get("error_description");
  const queryError = authErrorDescription || authError || null;
  const { isReady, user } = useSupabaseAuth();
  const [error, setError] = useState<string | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);
  const exchangeAttemptedRef = useRef(false);

  useEffect(() => {
    if (queryError) return;
    if (!isReady) return;
    const client = getSupabaseBrowserClient();

    if (!user && code && client && !exchangeAttemptedRef.current) {
      exchangeAttemptedRef.current = true;
      setIsExchanging(true);
      void client.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        setIsExchanging(false);
      });
      return;
    }

    if (!user) {
      if (code || isExchanging) {
        return;
      }
      router.replace("/login");
      return;
    }

    let active = true;
    const currentUser = user;

    async function syncProfile() {
      try {
        let profile: UserProfile | null = null;
        try {
          profile = await fetchCurrentProfile();
        } catch (requestError) {
          if (isProfileMissingError(requestError)) {
            profile = await upsertProfile(buildFallbackProfile(currentUser));
          } else {
            throw requestError;
          }
        }

        if (!active || !profile) return;
        router.replace(next || roleDestinations[profile.role]);
      } catch (requestError) {
        if (!active) return;
        setError(
          isFeatureUnavailableError(requestError) || isNetworkApiError(requestError)
            ? "LearnLoop is signed in, but the backend auth endpoints are still waking up. Please retry shortly."
            : requestError instanceof Error
              ? requestError.message
              : "We could not finish the LearnLoop sign-in flow.",
        );
      }
    }

    void syncProfile();

    return () => {
      active = false;
    };
  }, [code, isExchanging, isReady, next, queryError, router, user]);

  if (error || queryError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          title="LearnLoop could not finish sign-in"
          description={error || queryError || "LearnLoop sign-in did not complete."}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <LoadingState
        title="Connecting your LearnLoop workspace"
        description={
          isExchanging
            ? "Finishing the sign-in handshake with Supabase."
            : "Checking your profile and taking you to the right dashboard."
        }
      />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-10">
          <LoadingState
            title="Connecting your LearnLoop workspace"
            description="Checking your profile and taking you to the right dashboard."
          />
        </div>
      }
    >
      <AuthCallbackPageContent />
    </Suspense>
  );
}
