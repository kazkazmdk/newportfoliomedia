"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function TripcostHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const parts = pathname.split("/").filter(Boolean);
  const live =
    parts[0] === "tripcost" && parts[2] === "to"
      ? `${parts[1].replaceAll("-", " ")} → ${parts[3].replaceAll("-", " ")}`
      : "Select a route";
  return (
    <header className="tc-header">
      <Link href="/tripcost" className="tc-logo">
        TripCost
      </Link>
      <nav className={`tc-nav ${open ? "is-open" : ""}`}>
        <Link href="/tripcost" onClick={() => setOpen(false)}>Compare</Link>
        <Link href="/tripcost/paris/to/lyon" onClick={() => setOpen(false)}>Routes</Link>
        <Link href="/tripcost/paris/to/lyon#assumptions" onClick={() => setOpen(false)}>Methodology</Link>
      </nav>
      <p className="tc-live tc-mono uppercase">
        {live} <span aria-hidden>€</span>
      </p>
      <button type="button" className="tc-menu border border-[var(--tc-ink)] px-2 py-1 text-[10px] uppercase tracking-[0.16em]" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Route
      </button>
    </header>
  );
}
