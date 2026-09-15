"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "./use-reduced-motion";

export function MaskReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "wipe";
}) {
  const reduced = useReducedMotion();
  const hidden =
    direction === "left"
      ? { clipPath: "inset(0 100% 0 0)" }
      : direction === "wipe"
        ? { clipPath: "inset(0 0 0 100%)" }
        : { clipPath: "inset(100% 0 0 0)" };
  return (
    <motion.div
      className={className}
      initial={reduced ? false : hidden}
      whileInView={{ clipPath: "inset(0 0 0 0)" }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, delay, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  );
}
