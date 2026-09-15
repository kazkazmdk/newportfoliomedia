"use client";

import { useEffect, useState } from "react";
import { useFinePointer, useReducedMotion } from "./use-reduced-motion";

export function CursorFollower({
  label,
  color = "currentColor",
}: {
  label: string;
  color?: string;
}) {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const [pos, setPos] = useState({ x: -80, y: -80, seen: false });

  useEffect(() => {
    if (!fine || reduced) return;
    const move = (event: PointerEvent) => setPos({ x: event.clientX, y: event.clientY, seen: true });
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [fine, reduced]);

  if (!fine || reduced || !pos.seen) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[80] hidden mix-blend-difference md:block"
      style={{
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="grid size-16 place-items-center rounded-full border text-[9px] uppercase tracking-[0.22em]"
        style={{ borderColor: color, color }}
      >
        {label}
      </div>
    </div>
  );
}
