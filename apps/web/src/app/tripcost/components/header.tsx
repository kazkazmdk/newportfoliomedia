"use client";

import Link from "next/link";
import { useState } from "react";
import { useTripSelection } from "./trip-selection";

export function TripcostHeader() {
  const { from, to, fromName, toName, travellers, origins, destinations, go } = useTripSelection();
  const [open, setOpen] = useState(false);

  return (
    <header className="tc-planner">
      <Link href="/tripcost" className="tc-planner-mark">
        TripCost
      </Link>
      <form
        className="tc-planner-route"
        onSubmit={(event) => {
          event.preventDefault();
          go({});
        }}
      >
        <label>
          <span>From</span>
          <select aria-label="Origin city" value={from} onChange={(event) => go({ from: event.target.value })}>
            {origins.map((place) => (
              <option key={place.slug} value={place.slug}>{place.name}</option>
            ))}
          </select>
        </label>
        <i aria-hidden="true" />
        <label>
          <span>To</span>
          <select aria-label="Destination city" value={to} onChange={(event) => go({ to: event.target.value })}>
            {destinations.map((place) => (
              <option key={place.slug} value={place.slug}>{place.name}</option>
            ))}
          </select>
        </label>
        <label className="tc-planner-people">
          <span>Travellers</span>
          <select aria-label="Number of travellers" value={travellers} onChange={(event) => go({ travellers: Number(event.target.value) })}>
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
        </label>
        <button className="tc-planner-go" type="submit">Compare</button>
      </form>
      <p className="tc-planner-live" aria-live="polite">
        {fromName} → {toName}
      </p>
      <button type="button" className="tc-planner-menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        Atlas
      </button>
      <nav className={`tc-planner-drawer ${open ? "is-open" : ""}`} aria-label="TripCost">
        <Link href="/tripcost" onClick={() => setOpen(false)}>Planner</Link>
        <Link href="/tripcost/paris/to/lyon" onClick={() => setOpen(false)}>Paris → Lyon</Link>
        <Link href="/tripcost/paris/to/lyon#assumptions" onClick={() => setOpen(false)}>Cost methodology</Link>
      </nav>
    </header>
  );
}
