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
  const live = Boolean(power || protocol || port);
  return (
    <header className="cm-mast">
      <Link href="/chargematch" className="cm-mast-mark">
        ChargeMatch
      </Link>
      <nav id="chargematch-navigation" aria-label="ChargeMatch" className={`cm-mast-nav ${open ? "is-open" : ""}`}>
        <Link href="/chargematch/iphone-16" onClick={() => setOpen(false)}>Devices</Link>
        <Link href="/chargematch/kit" onClick={() => setOpen(false)}>Kits</Link>
        <Link href="/chargematch" onClick={() => setOpen(false)}>Check</Link>
      </nav>
      {live ? (
        <p className="cm-mast-live">
          <span className="cm-mono">{power ?? "—"}</span>
          <span>{protocol?.replaceAll("_", " ") ?? "Rated"}</span>
        </p>
      ) : (
        <p className="cm-mast-live">Rated path</p>
      )}
      <button type="button" className="cm-mast-menu" aria-expanded={open} aria-controls="chargematch-navigation" onClick={() => setOpen((v) => !v)}>
        Menu
      </button>
    </header>
  );
}
