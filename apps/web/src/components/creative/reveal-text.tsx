"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "./use-reduced-motion";

export function RevealText({
  text,
  as: Tag = "p",
  className = "",
  delay = 0,
}: {
  text: string;
  as?: "p" | "h1" | "h2" | "h3" | "span";
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={reduced ? false : { y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.55, delay: delay + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
