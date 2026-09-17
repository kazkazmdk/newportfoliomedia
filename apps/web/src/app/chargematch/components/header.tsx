"use client";

import Link from "next/link";
import { useState } from "react";

export function ChargematchHeader({
  port,
  protocol,
  power,
}: {
  port?: string;
  protocol?: string;
  power?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="cm-header">
      <Link href="/chargematch" className="cm-brand cm-mono">
        <span className="cm-brand-mark">CM</span>
        <span>ChargeMatch</span>
      </Link>
      <nav id="chargematch-navigation" aria-label="ChargeMatch" className={`cm-nav ${open ? "is-open" : ""}`}>
        <Link href="/chargematch" onClick={() => setOpen(false)}>Check</Link>
        <Link href="/chargematch/iphone-16" onClick={() => setOpen(false)}>Devices</Link>
        <Link href="/chargematch/iphone-16/with/apple-20w" onClick={() => setOpen(false)}>Chargers</Link>
        <Link href="/chargematch/kit" onClick={() => setOpen(false)}>Power kit</Link>
      </nav>
      <p className="cm-live cm-mono">
        Rated model <span className="cm-dot" />
      </p>
      <button
        type="button"
        className="cm-menu"
        aria-expanded={open}
        aria-controls="chargematch-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        Panel
      </button>
      <div className="cm-strip" style={{ gridColumn: "1 / -1" }}>
        <span>Port {port ?? "—"}</span>
        <span>Protocol {protocol ?? "—"}</span>
        <span>Power {power ?? "—"}</span>
        <span>Evidence: published specs · not measured</span>
      </div>
    </header>
  );
}
