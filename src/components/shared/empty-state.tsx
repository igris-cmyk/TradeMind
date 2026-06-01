"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp, spring } from "@/lib/motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      {...fadeUp}
      transition={spring.gentle}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 mb-5">
        <Icon className="h-8 w-8 text-primary-400/60" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-5">{description}</p>
      {actionLabel && onAction && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring.snappy}>
          <Button onClick={onAction} size="sm" variant="glow">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
