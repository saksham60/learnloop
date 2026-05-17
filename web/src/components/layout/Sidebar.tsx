"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItem } from "@/lib/constants";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-glass backdrop-blur lg:flex">
      <Link href="/" className="rounded-2xl px-2 py-3">
        <div className="font-display text-2xl text-foreground">{APP_NAME}</div>
        <div className="mt-1 text-sm text-muted-foreground">{APP_TAGLINE}</div>
      </Link>
      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group rounded-2xl px-4 py-3 transition",
                active ? "bg-primary text-primary-foreground shadow-soft" : "hover:bg-secondary",
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </div>
              {item.description ? (
                <p
                  className={cn(
                    "mt-2 text-xs",
                    active ? "text-primary-foreground/85" : "text-muted-foreground",
                  )}
                >
                  {item.description}
                </p>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

