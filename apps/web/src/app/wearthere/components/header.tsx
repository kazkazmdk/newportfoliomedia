"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useClimateMood } from "./climate-context";

export function WearthereHeader() {
  const pathname = usePathname();
  const { view, setView, place } = useClimateMood();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const citySlug = pathname.split("/")[2];
  const city = place?.city ?? (citySlug ? citySlug.replaceAll("-", " ") : null);
  const country = place?.country;
  const month = place?.month;

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`wt-mast ${solid ? "is-solid" : ""}`}>
      <Link href="/wearthere" className="wt-mast-mark">
        WearThere
      </Link>
      <p className="wt-mast-place">
        {city ? (
          <>
            <span>{city}</span>
            {month ? <span>{month}</span> : null}
            {country ? <span>{country}</span> : null}
          </>
        ) : (
          <span>Choose a climate</span>
        )}
      </p>
      <div className="wt-mast-modes" role="group" aria-label="Scene mode">
        <button type="button" aria-pressed={view === "climate"} onClick={() => setView("climate")}>
          Climate
        </button>
        <button type="button" aria-pressed={view === "pack"} onClick={() => setView("pack")}>
          Pack
        </button>
      </div>
      <Link href="/wearthere#plan" className="wt-mast-plan">
        Plan
      </Link>
      <button type="button" className="wt-mast-index" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Index
      </button>
      <nav className={`wt-mast-drawer ${open ? "is-open" : ""}`} aria-label="WearThere">
        <Link href="/wearthere#destinations" onClick={() => setOpen(false)}>Destinations</Link>
        <Link href="/wearthere#plan" onClick={() => setOpen(false)}>Plan a capsule</Link>
      </nav>
    </header>
  );
}
