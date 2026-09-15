import type { ReactNode } from "react";

export function Marquee({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`creative-marquee ${className}`}>
      <div className="creative-marquee-track">
        <div>{children}</div>
        <div aria-hidden>{children}</div>
      </div>
    </div>
  );
}
