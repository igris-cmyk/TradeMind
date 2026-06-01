"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

export default function TradesTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
