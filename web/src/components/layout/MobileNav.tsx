"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 rounded-[2rem] border border-white/80 bg-white/90 p-2 shadow-glass backdrop-blur lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.slice(0, 4).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-2xl px-2 py-3 text-center text-[11px] font-medium transition",
                active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-secondary",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="leading-tight">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
