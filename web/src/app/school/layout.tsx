"use client";

import type { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { schoolNav } from "@/lib/constants";

export default function SchoolLayout({ children }: PropsWithChildren) {
  return (
    <RoleGate allowedRoles={["school", "school_admin"]}>
      <AppShell title="School Portal" navItems={schoolNav}>
        {children}
      </AppShell>
    </RoleGate>
  );
}
