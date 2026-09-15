"use client";

import { useState, type ReactNode } from "react";
import { CursorFollower } from "./cursor-follower";

export function CursorCanvas({
  label,
  color,
  children,
  className,
}: {
  label: string;
  color?: string;
  children: ReactNode;
  className?: string;
}) {
  const [hot, setHot] = useState(false);
  return (
    <div
      className={className}
      data-cursor={label}
      onPointerEnter={() => setHot(true)}
      onPointerLeave={() => setHot(false)}
    >
      {hot ? <CursorFollower label={label} color={color} /> : null}
      {children}
    </div>
  );
}
