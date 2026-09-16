"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function WearthereHeader() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`wt-header ${solid ? "is-solid" : ""}`}>
      <Link href="/wearthere" className="wt-wordmark">
        <span>Wear</span>
        <span>There</span>
      </Link>
      <nav className={`wt-nav ${open ? "is-open" : ""}`}>
        <Link href="/wearthere#destinations" onClick={() => setOpen(false)}>Destinations</Link>
        <Link href="/wearthere#weather" onClick={() => setOpen(false)}>Weather</Link>
        <Link href="/wearthere/tokyo" onClick={() => setOpen(false)}>Capsule</Link>
      </nav>
      <Link href="/wearthere#plan" className={`wt-plan ${open ? "is-open" : ""}`}>
        Search / Plan trip
      </Link>
      <button type="button" className="wt-menu wt-plan" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Index
      </button>
    </header>
  );
}
