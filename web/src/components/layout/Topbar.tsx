"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { UserProfile } from "@/features/auth/types";
import { useAuthActions } from "@/features/auth/hooks/useAuthActions";
import {
  getDemoRoleDestinations,
  clearDemoProfile,
  setDemoRole,
  useDemoProfile,
  type DemoAccessRole,
} from "@/lib/demo/demo-auth";
import { APP_TAGLINE } from "@/lib/constants";
import { useSupabaseAuth } from "@/providers/SupabaseProvider";

export function Topbar({
  title,
  profile,
}: {
  title: string;
  profile?: UserProfile | null;
}) {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const { user } = useSupabaseAuth();
  const demoProfile = useDemoProfile();
  const demoDestinations = getDemoRoleDestinations();
  const isDemoActive = Boolean(demoProfile && demoProfile.id === profile?.id);
  const [selectedRole, setSelectedRole] = useState<DemoAccessRole>(() =>
    (demoProfile?.role as DemoAccessRole) || (profile?.role as DemoAccessRole) || "student",
  );

  function handleSwitchDemoRole() {
    setDemoRole(selectedRole);
    router.replace(demoDestinations[selectedRole]);
  }

  function handleExitDemoMode() {
    clearDemoProfile();
    router.replace(user ? "/auth/callback" : "/login");
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/70 bg-white/80 px-5 py-4 shadow-glass backdrop-blur">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
      </div>
      <div className="flex items-center gap-3">
        {isDemoActive ? (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2">
            <Badge variant="outline">Demo Mode</Badge>
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as DemoAccessRole)}
              className="h-9 rounded-xl border border-input bg-white px-3 text-sm"
            >
              <option value="student">Demo Student</option>
              <option value="parent">Demo Parent</option>
              <option value="school_admin">Demo School</option>
              <option value="teacher">Demo Teacher</option>
              <option value="platform_admin">Demo Master Admin</option>
            </select>
            <Button type="button" variant="secondary" size="sm" onClick={handleSwitchDemoRole}>
              Switch Demo Role
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleExitDemoMode}>
              Exit Demo Mode
            </Button>
          </div>
        ) : null}
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
