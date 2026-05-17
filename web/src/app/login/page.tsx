"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailSignInForm } from "@/features/auth/components/EmailSignInForm";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";
import { BackendHealthBadge } from "@/features/health/components/BackendHealthBadge";
import { APP_NAME, APP_TAGLINE, featureFlags } from "@/lib/constants";
import { useSupabaseAuth } from "@/providers/SupabaseProvider";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { isReady, user } = useSupabaseAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!user) return;
    router.replace(`/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }, [isReady, next, router, user]);

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 md:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">LearnLoop AI</p>
          <div className="mt-4">
            <BackendHealthBadge />
          </div>
          <h1 className="mt-4 font-display text-5xl leading-tight">
            The cleanest way to enter a guided learning workspace.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Sign in with Google or email to access a student, teacher, or school dashboard
            designed around thinking before telling.
          </p>
        </div>

        <Card className="mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle className="font-display text-3xl">{APP_NAME}</CardTitle>
            <CardDescription>{APP_TAGLINE}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {featureFlags.googleAuth || featureFlags.emailAuth ? (
              <Tabs
                defaultValue={featureFlags.googleAuth ? "google" : "email"}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="google" disabled={!featureFlags.googleAuth}>
                    Google
                  </TabsTrigger>
                  <TabsTrigger value="email" disabled={!featureFlags.emailAuth}>
                    Email
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="google" className="space-y-3">
                  <GoogleSignInButton className="w-full" nextPath={next || undefined} />
                  <p className="text-sm text-muted-foreground">
                    Fastest path if your school uses Google accounts.
                  </p>
                </TabsContent>
                <TabsContent value="email" className="space-y-3">
                  <EmailSignInForm nextPath={next || undefined} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                No login provider is enabled yet. Turn on Google auth or email auth in the frontend
                environment to unlock sign-in.
              </div>
            )}
            <p className="text-sm leading-6 text-muted-foreground">
              Your access role is determined after sign-in. Pending users will see an approval
              screen until their school role is confirmed.
            </p>
            <p className="text-sm text-muted-foreground">
              Looking for context first? <Link href="/about" className="text-primary underline-offset-4 hover:underline">Read about LearnLoop.</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Card>
            <CardContent className="py-10">
              <p className="text-sm text-muted-foreground">Preparing sign-in...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
