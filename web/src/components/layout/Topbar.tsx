"use client";

import { Bell, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";
import { APP_TAGLINE } from "@/lib/constants";
import type { UserProfile } from "@/features/auth/types";
import { useAuthActions } from "@/features/auth/hooks/useAuthActions";

export function Topbar({
  title,
  profile,
}: {
  title: string;
  profile?: UserProfile | null;
}) {
  const { signOut } = useAuthActions();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/70 bg-white/80 px-5 py-4 shadow-glass backdrop-blur">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-3 py-2">
          <UserAvatar
            name={profile?.full_name}
            image={profile?.avatar_url || null}
            className="h-9 w-9"
          />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium">{profile?.full_name || "LearnLoop user"}</p>
            <p className="text-xs text-muted-foreground">{profile?.role || "member"}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

