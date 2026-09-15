"use client";

import Link from "next/link";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { useFinePointer, useReducedMotion } from "./use-reduced-motion";

export function MagneticLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  function move(event: MouseEvent<HTMLAnchorElement>) {
    if (!fine || reduced || !ref.current) return;
    const box = ref.current.getBoundingClientRect();
    const x = event.clientX - box.left - box.width / 2;
    const y = event.clientY - box.top - box.height / 2;
    ref.current.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
  }

  function leave() {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0, 0)";
  }

  return (
    <Link ref={ref} href={href} className={className} onMouseMove={move} onMouseLeave={leave}>
      {children}
    </Link>
  );
}
