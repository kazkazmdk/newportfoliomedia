"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { StateBadge, type FixcodeState } from "./system-ui";

const NAV = [
  { href: "/fixcode/diagnose", label: "Start diagnosis" },
  { href: "/fixcode#code-index", label: "Code index" },
  { href: "/fixcode#appliance-index", label: "Appliances" },
];

export function FixcodeHeader({
  onOpenTrace,
  status = "idle",
}: {
  onOpenTrace?: () => void;
  status?: "idle" | "warn" | "risk";
}) {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const systemState: FixcodeState = status === "risk" ? "stop" : status === "warn" ? "caution" : "ready";

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fc-header ${compact ? "is-compact" : ""}`}>
      <Link href="/fixcode" className="fc-mark">
        <span className="fc-mark-dot">FC.</span>
        <span className="fc-mark-name">FixCode / FC.01</span>
      </Link>
      <nav id="fixcode-navigation" className={`fc-nav ${open ? "is-open" : ""}`} aria-label="FixCode">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.href === "/fixcode/diagnose" && pathname.startsWith(item.href) ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="fc-status">
        <StateBadge state={systemState}>{systemState === "ready" ? "System ready" : undefined}</StateBadge>
        {onOpenTrace ? (
          <button type="button" className="fixcode-mono" onClick={onOpenTrace}>
            Source trace
          </button>
        ) : (
          <Link href="/ops" className="fixcode-mono">
            Source trace
          </Link>
        )}
      </div>
      <button type="button" className="fc-menu" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="fixcode-navigation">
        Menu
      </button>
    </header>
  );
}
