"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { type FixcodeState } from "./system-ui";

export function FixcodeHeader({
  onOpenTrace,
  status = "idle",
}: {
  onOpenTrace?: () => void;
  status?: "idle" | "warn" | "risk";
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const systemState: FixcodeState = status === "risk" ? "stop" : status === "warn" ? "caution" : "ready";

  return (
    <header className="fc-mast">
      <Link href="/fixcode" className="fc-mast-mark">
        FixCode
      </Link>
      <nav id="fixcode-navigation" className={`fc-mast-nav ${open ? "is-open" : ""}`} aria-label="FixCode">
        <Link href="/fixcode/diagnose" aria-current={pathname.startsWith("/fixcode/diagnose") ? "page" : undefined} onClick={() => setOpen(false)}>
          Diagnose
        </Link>
        <Link href="/fixcode#code-index" onClick={() => setOpen(false)}>
          Browse
        </Link>
      </nav>
      <div className="fc-mast-led" data-state={systemState} aria-label={`System ${systemState}`}>
        <i />
        {onOpenTrace ? (
          <button type="button" onClick={onOpenTrace}>Evidence</button>
        ) : (
          <Link href="/ops">Evidence</Link>
        )}
      </div>
      <button type="button" className="fc-mast-menu" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="fixcode-navigation">
        Menu
      </button>
    </header>
  );
}
