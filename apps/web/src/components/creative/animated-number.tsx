"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

export function AnimatedNumber({
  value,
  className = "",
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  value: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const reduced = useReducedMotion();
  const fromRef = useRef(value);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (reduced) return;
    const start = fromRef.current;
    const delta = value - start;
    const startAt = performance.now();
    const duration = 520;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startAt) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = start + delta * eased;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced]);

  const display = reduced ? value : shown;
  return (
    <span className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
