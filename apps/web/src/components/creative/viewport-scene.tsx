import type { ReactNode } from "react";

export function ViewportScene({
  id,
  children,
  className = "",
  full = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  full?: boolean;
}) {
  return (
    <section
      id={id}
      className={`relative ${full ? "min-h-[100svh]" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
