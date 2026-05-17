"use client";

import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthActions } from "@/features/auth/hooks/useAuthActions";

export function GoogleSignInButton({
  nextPath,
  className,
}: {
  nextPath?: string;
  className?: string;
}) {
  const { signInWithGoogle } = useAuthActions();

  return (
    <Button className={className} onClick={() => signInWithGoogle(nextPath)}>
      <LogIn className="h-4 w-4" />
      Continue with Google
    </Button>
  );
}
