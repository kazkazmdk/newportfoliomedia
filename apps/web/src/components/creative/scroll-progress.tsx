"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

export function ScrollProgress({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={`pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] ${className}`} aria-hidden>
      <div
        className="h-full origin-left bg-current"
        style={{
          transform: `scaleX(${p})`,
          transition: reduced ? "none" : "transform 80ms linear",
        }}
      />
    </div>
  );
}
