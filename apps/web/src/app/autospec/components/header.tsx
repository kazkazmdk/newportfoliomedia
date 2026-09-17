"use client";

import Link from "next/link";
import { useState } from "react";

export function AutospecHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="as-header">
      <Link href="/autospec" className="as-logo">
        <span>Auto</span>Spec
      </Link>
      <nav id="autospec-navigation" className={`as-nav ${open ? "is-open" : ""}`} aria-label="AutoSpec">
        <Link href="/autospec/garage" onClick={() => setOpen(false)}>Garage</Link>
        <Link href="/autospec/bmw/3-series/g20/320d-b47" onClick={() => setOpen(false)}>Vehicle</Link>
        <Link href="/autospec/bmw/3-series/g20/320d-b47/maintenance" onClick={() => setOpen(false)}>Service</Link>
        <Link href="/autospec/bmw/3-series/g20/320d-b47/oil" onClick={() => setOpen(false)}>Spec</Link>
      </nav>
      <div className="flex items-center gap-4">
        <span className="as-system-state"><i aria-hidden />Reference system</span>
        <Link href="/autospec/garage" className="as-add">+ Add vehicle</Link>
        <button type="button" className="as-menu as-add" aria-expanded={open} aria-controls="autospec-navigation" onClick={() => setOpen((v) => !v)}>
          Menu
        </button>
      </div>
    </header>
  );
}
