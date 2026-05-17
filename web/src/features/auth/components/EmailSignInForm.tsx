"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck, SendHorizonal } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthActions } from "@/features/auth/hooks/useAuthActions";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type EmailSignInValues = z.infer<typeof emailSchema>;

export function EmailSignInForm({ nextPath }: { nextPath?: string }) {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const { signInWithEmail } = useAuthActions();
  const form = useForm<EmailSignInValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: EmailSignInValues) {
    const ok = await signInWithEmail(values.email, nextPath);
    if (!ok) return;

    setSubmittedEmail(values.email);
    form.reset({ email: values.email });
  }

  return (
    <div className="space-y-4">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email-auth">Email address</Label>
          <Input
            id="email-auth"
            type="email"
            autoComplete="email"
            placeholder="student@school.edu"
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-rose-600">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
          <SendHorizonal className="h-4 w-4" />
          Continue with Email
        </Button>
      </form>

      <div className="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground">
        LearnLoop sends a secure magic link to your inbox. After you open it, the same profile and
        role routing flow continues through the app callback.
      </div>

      {submittedEmail ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <div className="flex items-center gap-2 font-medium">
            <MailCheck className="h-4 w-4" />
            Magic link sent
          </div>
          <p className="mt-1">
            Check <span className="font-medium">{submittedEmail}</span> and open the LearnLoop
            sign-in link to continue.
          </p>
        </div>
      ) : null}
    </div>
  );
}
