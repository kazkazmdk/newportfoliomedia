"use client";

import Link from "next/link";
import { useState } from "react";

export function AutospecHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="as-header">
      <Link href="/autospec" className="as-logo">
        AutoSpec
      </Link>
      <nav className={`as-nav ${open ? "is-open" : ""}`}>
        <Link href="/autospec/garage" onClick={() => setOpen(false)}>Garage</Link>
        <Link href="/autospec/bmw/3-series/g20/320d-b47" onClick={() => setOpen(false)}>Vehicle</Link>
        <Link href="/autospec/bmw/3-series/g20/320d-b47/maintenance" onClick={() => setOpen(false)}>Service</Link>
        <Link href="/autospec/bmw/3-series/g20/320d-b47/oil" onClick={() => setOpen(false)}>Spec</Link>
      </nav>
      <div className="flex items-center gap-4">
        <span className="hidden text-[10px] uppercase tracking-[0.2em] md:inline">My garage / 01</span>
        <Link href="/autospec/garage" className="as-add">+ Add vehicle</Link>
        <button type="button" className="as-menu as-add" onClick={() => setOpen((v) => !v)}>
          Menu
        </button>
      </div>
    </header>
  );
}
