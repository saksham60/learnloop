"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glass backdrop-blur md:flex-row md:items-end md:justify-between"
    >
      <div className="space-y-3">
        {eyebrow ? <Badge variant="outline">{eyebrow}</Badge> : null}
        <div className="space-y-2">
          <h1 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            {description}
          </p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
}
