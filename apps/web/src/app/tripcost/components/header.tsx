"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function TripcostHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const parts = pathname.split("/").filter(Boolean);
  const live = parts[0] === "tripcost" && parts[2] === "to";
  const from = live ? parts[1].replaceAll("-", " ") : null;
  const to = live ? parts[3].replaceAll("-", " ") : null;

  return (
    <header className="tc-mast">
      <Link href="/tripcost" className="tc-mast-mark">
        TripCost
      </Link>
      <p className="tc-mast-route">
        {live ? (
          <>
            <span>{from}</span>
            <i aria-hidden />
            <span>{to}</span>
          </>
        ) : (
          <span>Europe corridors</span>
        )}
      </p>
      <Link href="/tripcost/paris/to/lyon" className="tc-mast-people">
        {live ? "Routes" : "Routes"}
      </Link>
      <button type="button" className="tc-mast-menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Route
      </button>
      <nav className={`tc-mast-drawer ${open ? "is-open" : ""}`}>
        <Link href="/tripcost" onClick={() => setOpen(false)}>Home</Link>
        <Link href="/tripcost/paris/to/lyon" onClick={() => setOpen(false)}>Paris → Lyon</Link>
        <Link href="/tripcost/paris/to/lyon#assumptions" onClick={() => setOpen(false)}>Method</Link>
      </nav>
    </header>
  );
}
