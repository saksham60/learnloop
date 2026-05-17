"use client";

import type { PropsWithChildren } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Topbar } from "@/components/layout/Topbar";
import type { NavItem } from "@/lib/constants";
import { useCurrentProfile } from "@/features/auth/hooks/useCurrentProfile";

export function AppShell({
  title,
  navItems,
  children,
}: PropsWithChildren<{
  title: string;
  navItems: NavItem[];
}>) {
  const { data: profile } = useCurrentProfile();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 md:px-6 lg:px-8 lg:py-6">
      <Sidebar items={navItems} />
      <div className="flex min-w-0 flex-1 flex-col gap-4 pb-24 lg:pb-0">
        <Topbar title={title} profile={profile ?? null} />
        <main className="flex-1">{children}</main>
      </div>
      <MobileNav items={navItems} />
    </div>
  );
}
