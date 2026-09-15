"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/fixcode/diagnose", label: "Diagnose" },
  { href: "/fixcode/samsung/washer", label: "Errors" },
  { href: "/fixcode/samsung/washer", label: "Appliances" },
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
      <nav className={`fc-nav ${open ? "is-open" : ""}`}>
        {NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="fc-status">
        <span className="fixcode-mono">System status</span>
        <span className={`fc-led ${status === "risk" ? "risk" : status === "warn" ? "warn" : ""}`} />
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
      <button type="button" className="fc-menu" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        Menu
      </button>
    </header>
  );
}
