"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompanionMessage } from "@/features/student-companion/types";

export function ChatMessage({ message }: { message: CompanionMessage }) {
  const isStudent = message.role === "student";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex", isStudent ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-[1.75rem] px-4 py-3 shadow-sm",
          isStudent ? "bg-primary text-primary-foreground" : "border border-border bg-white text-foreground",
        )}
      >
        {message.label ? (
          <Badge
            className={cn(
              "mb-2 rounded-full px-2.5 py-1 text-[11px]",
              isStudent ? "bg-white/15 text-primary-foreground" : "bg-primary/10 text-primary",
            )}
          >
            {message.label}
          </Badge>
        ) : null}
        <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
      </div>
    </motion.div>
  );
}
