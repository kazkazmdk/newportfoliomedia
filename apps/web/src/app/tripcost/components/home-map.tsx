"use client";

import { compareRoute, PLACES, ROUTES } from "@penta/tripcost";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { RouteMap } from "./route-map";

const LABELS: Record<string, string> = {
  car: "Car",
  ev: "EV",
  train: "Train",
  bus: "Bus",
  flight: "Flight",
  rideshare: "Rideshare",
};

function fmtDoor(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h${String(mins).padStart(2, "0")}` : `${mins} min`;
}

export function HomeMap() {
  const router = useRouter();
  const [from, setFrom] = useState("paris");
  const [to, setTo] = useState("lyon");
  const [travellers, setTravellers] = useState(2);

  const origins = useMemo(
    () => PLACES.filter((p) => ROUTES.some((r) => r.from.slug === p.slug)),
    [],
  );
  const destinations = useMemo(() => ROUTES.filter((r) => r.from.slug === from).map((r) => r.to), [from]);
  const dest = destinations.some((p) => p.slug === to) ? to : destinations[0]?.slug;
  const corridor = ROUTES.find((r) => r.from.slug === from && r.to.slug === dest);
  const preview = useMemo(
    () => (corridor ? compareRoute(corridor, travellers, false) : null),
    [corridor, travellers],
  );
  const fastest = preview ? [...preview.modes].sort((a, b) => a.minutes_door - b.minutes_door)[0] : null;
  const cheapest = preview ? [...preview.modes].sort((a, b) => a.cash_eur - b.cash_eur)[0] : null;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!dest) return;
    router.push(`/tripcost/${from}/to/${dest}?travellers=${travellers}`);
  }

  return (
    <section className="tc-hero tc-home-hero">
      <div className="tc-map-intro">
        <p className="tc-kicker">Travel decision studio · Europe</p>
        <h1>See what the journey really asks of you.</h1>
        <p>
          Compare typical cash and door-to-door time across every available mode. Estimates are transparent, never live tickets.
        </p>
      </div>
      <RouteMap from={from} to={dest} mode={preview?.best} />
      <form onSubmit={onSubmit} className="tc-form tc-home-form">
        <p className="tc-form-title">
          <span>Build a comparison</span>
          <span className="tc-mono">A → B</span>
        </p>
        <label>
          <span><b aria-hidden="true">A</b> From</span>
          <select
            aria-label="Origin city"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              const next = ROUTES.find((r) => r.from.slug === e.target.value);
              if (next) setTo(next.to.slug);
            }}
          >
            {origins.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span><b aria-hidden="true">B</b> To</span>
          <select aria-label="Destination city" value={dest} onChange={(e) => setTo(e.target.value)}>
            {destinations.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          People · {travellers}
          <input
            type="range"
            min={1}
            max={6}
            value={travellers}
            aria-label="Number of travellers"
            onChange={(e) => setTravellers(Number(e.target.value))}
          />
        </label>
        <button className="tc-cta" type="submit">
          Compare trip <span aria-hidden="true">↗</span>
        </button>
      </form>
      {corridor && preview ? (
        <aside className="tc-preview" aria-label="Comparison preview" aria-live="polite">
          <div className="tc-preview-head">
            <p className="tc-kicker">Before you compare</p>
            <p className="tc-mono">{corridor.km} km · modelled corridor</p>
          </div>
          <div className="tc-preview-grid">
            <div>
              <span>Cheapest cash</span>
              <strong>{cheapest ? `${LABELS[cheapest.mode]} · €${cheapest.cash_eur}` : "—"}</strong>
            </div>
            <div>
              <span>Fastest door-to-door</span>
              <strong>{fastest ? `${LABELS[fastest.mode]} · ${fmtDoor(fastest.minutes_door)}` : "—"}</strong>
            </div>
            <div>
              <span>Best for {travellers}</span>
              <strong>{LABELS[preview.best]}</strong>
            </div>
          </div>
          <p className="tc-preview-note">
            Heuristic estimates from existing corridor data · not live fares · full assumptions shown after comparison
          </p>
        </aside>
      ) : null}
    </section>
  );
}
