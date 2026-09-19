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
  const [edit, setEdit] = useState<"from" | "to" | "people" | null>(null);

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
  const fromName = origins.find((p) => p.slug === from)?.name ?? from;
  const toName = destinations.find((p) => p.slug === dest)?.name ?? dest;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!dest) return;
    router.push(`/tripcost/${from}/to/${dest}?travellers=${travellers}`);
  }

  return (
    <section className="tc-atlas">
      <RouteMap from={from} to={dest} mode={preview?.best} />
      <form onSubmit={onSubmit} className="tc-atlas-ui">
        <div className="tc-atlas-pair">
          <button type="button" onClick={() => setEdit(edit === "from" ? null : "from")}>
            <span>From</span>
            <strong>{fromName}</strong>
          </button>
          <button type="button" onClick={() => setEdit(edit === "to" ? null : "to")}>
            <span>To</span>
            <strong>{toName}</strong>
          </button>
          <button type="button" onClick={() => setEdit(edit === "people" ? null : "people")}>
            <span>Travellers</span>
            <strong>{String(travellers).padStart(2, "0")}</strong>
          </button>
        </div>
        {edit === "from" ? (
          <label>
            Origin
            <select aria-label="Origin city" value={from} onChange={(e) => {
              setFrom(e.target.value);
              const next = ROUTES.find((r) => r.from.slug === e.target.value);
              if (next) setTo(next.to.slug);
            }}>
              {origins.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </select>
          </label>
        ) : null}
        {edit === "to" ? (
          <label>
            Destination
            <select aria-label="Destination city" value={dest} onChange={(e) => setTo(e.target.value)}>
              {destinations.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </select>
          </label>
        ) : null}
        <label className={edit === "people" ? "tc-people-edit" : "tc-people-edit is-compact"}>
          People · {travellers}
          <input type="range" min={1} max={6} value={travellers} aria-label="Number of travellers" onChange={(e) => setTravellers(Number(e.target.value))} />
        </label>
        {corridor && preview ? (
          <ul className="tc-atlas-decisions">
            <li>
              <span>Cheapest</span>
              <b>€{cheapest?.cash_eur ?? "—"}</b>
              <small>{cheapest ? LABELS[cheapest.mode] : ""}</small>
            </li>
            <li>
              <span>Fastest</span>
              <b>{fastest ? fmtDoor(fastest.minutes_door) : "—"}</b>
              <small>{fastest ? LABELS[fastest.mode] : ""}</small>
            </li>
            <li>
              <span>Best for {travellers}</span>
              <b>{LABELS[preview.best]}</b>
            </li>
          </ul>
        ) : null}
        <button className="tc-cta" type="submit">Compare trip</button>
        <p className="tc-atlas-note">Modelled prices · not live fares</p>
      </form>
    </section>
  );
}
