"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "./use-reduced-motion";

export function SvgPathDraw({
  d,
  className = "",
  duration = 0.9,
}: {
  d: string;
  className?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.path
      d={d}
      className={className}
      fill="none"
      initial={reduced ? false : { pathLength: 0, opacity: 0.2 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
