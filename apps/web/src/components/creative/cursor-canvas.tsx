"use client";

import { useState, type HTMLAttributes, type ReactNode } from "react";
import { CursorFollower } from "./cursor-follower";

export function CursorCanvas({
  label,
  color,
  children,
  className,
  ...rest
}: {
  label: string;
  color?: string;
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  const [hot, setHot] = useState(false);
  return (
    <div
      className={className}
      data-cursor={label}
      onPointerEnter={() => setHot(true)}
      onPointerLeave={() => setHot(false)}
      {...rest}
    >
      {hot ? <CursorFollower label={label} color={color} /> : null}
      {children}
    </div>
  );
}
