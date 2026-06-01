"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "text" | "avatar" | "chart" | "button";
  count?: number;
}

export function LoadingSkeleton({
  className,
  variant = "text",
  count = 1,
}: LoadingSkeletonProps) {
  const variants = {
    text: "h-4 w-full",
    card: "h-32 w-full rounded-xl",
    avatar: "h-8 w-8 rounded-full",
    chart: "h-64 w-full rounded-xl",
    button: "h-9 w-24 rounded-lg",
  };

  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("skeleton", variants[variant], className)}
        />
      ))}
    </div>
  );
}
