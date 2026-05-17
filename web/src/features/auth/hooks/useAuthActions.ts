"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { clearDemoProfile, getDemoProfile } from "@/lib/demo/demo-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/providers/SupabaseProvider";

export function useAuthActions() {
  const router = useRouter();
  const { isEnabled } = useSupabaseAuth();

  function getBrowserOrigin() {
    const url = new URL(window.location.origin);
    if (url.hostname === "127.0.0.1" || url.hostname === "0.0.0.0") {
      url.hostname = "localhost";
    }
    return url.origin;
  }

  function buildRedirectUrl(nextPath?: string) {
    const appOrigin =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || getBrowserOrigin();
    const redirectUrl = new URL("/auth/callback", appOrigin);
    if (nextPath) {
      redirectUrl.searchParams.set("next", nextPath);
    }
    return redirectUrl.toString();
  }

  async function signInWithGoogle(nextPath?: string) {
    const client = getSupabaseBrowserClient();
    if (!client || !isEnabled) {
      toast.error("Supabase Google Auth is not configured yet.");
      return;
    }

    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: buildRedirectUrl(nextPath) },
    });

    if (error) {
      toast.error(error.message);
    }
  }

  async function signInWithEmail(email: string, nextPath?: string) {
    const client = getSupabaseBrowserClient();
    if (!client || !isEnabled) {
      toast.error("Supabase email auth is not configured yet.");
      return false;
    }

    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: buildRedirectUrl(nextPath),
        shouldCreateUser: true,
      },
    });

    if (error) {
      toast.error(error.message);
      return false;
    }

    toast.success("Check your email for the LearnLoop sign-in link.");
    return true;
  }

  async function signOut() {
    if (getDemoProfile()) {
      clearDemoProfile();
    }
    const client = getSupabaseBrowserClient();
    if (client) {
      await client.auth.signOut();
    }
    router.replace("/login");
  }

  return { signInWithGoogle, signInWithEmail, signOut };
}
