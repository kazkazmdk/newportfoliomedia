"use client";

import { DESTINATIONS, MONTHS } from "@penta/wearthere";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useClimateMood } from "./climate-context";

export function WearthereHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { view, setView, place } = useClimateMood();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const citySlug = pathname.split("/")[2] ?? place?.slug ?? "tokyo";
  const monthLabel = place?.month ?? "Nov";
  const monthIndex = Math.max(MONTHS.findIndex((month) => month.toLowerCase().startsWith(monthLabel.toLowerCase().slice(0, 3))), 0);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`wt-issue ${solid ? "is-solid" : ""}`}>
      <div className="wt-issue-top">
        <Link href="/wearthere" className="wt-issue-mark">
          WearThere
        </Link>
        <form
          className="wt-issue-search"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const city = String(data.get("city") ?? citySlug);
            router.push(`/wearthere/${city}`);
          }}
        >
          <label>
            <span>Destination</span>
            <select name="city" aria-label="Destination" defaultValue={citySlug} key={citySlug}>
              {DESTINATIONS.map((dest) => <option key={dest.slug} value={dest.slug}>{dest.city}</option>)}
            </select>
          </label>
          <label>
            <span>When to go</span>
            <select name="month" aria-label="Month" defaultValue={String(monthIndex + 1)} key={monthIndex}>
              {MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
            </select>
          </label>
          <button type="submit">Open issue</button>
        </form>
        <button type="button" className="wt-issue-index" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          Index
        </button>
      </div>
      <nav className={`wt-issue-nav ${open ? "is-open" : ""}`} aria-label="WearThere">
        <Link href="/wearthere#destinations" onClick={() => setOpen(false)}>Destinations</Link>
        <Link href={`/wearthere/${citySlug}`} onClick={() => setOpen(false)}>When to go</Link>
        <Link href={`/wearthere/${citySlug}`} onClick={() => setOpen(false)}>What to pack</Link>
        <div className="wt-issue-modes" role="group" aria-label="Scene mode">
          <button type="button" aria-pressed={view === "climate"} onClick={() => setView("climate")}>Climate</button>
          <button type="button" aria-pressed={view === "pack"} onClick={() => setView("pack")}>Pack</button>
        </div>
      </nav>
    </header>
  );
}
