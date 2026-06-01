"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { spring, tap } from "@/lib/motion";
import { cn } from "@/lib/utils";

type MotionButtonProps = HTMLMotionProps<"button"> & {
  magnetic?: boolean;
};

export function MotionButton({
  className,
  children,
  magnetic = false,
  ...props
}: MotionButtonProps) {
  return (
    <motion.button
      whileHover={magnetic ? { scale: 1.02, y: -1 } : { scale: 1.01 }}
      whileTap={tap.press}
      transition={spring.snappy}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
