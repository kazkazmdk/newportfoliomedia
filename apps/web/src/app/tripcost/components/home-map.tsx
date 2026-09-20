"use client";

import { compareRoute } from "@penta/tripcost";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo } from "react";
import { RouteMap } from "./route-map";
import { useTripSelection } from "./trip-selection";

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
  const { from, to, fromName, toName, travellers, corridor } = useTripSelection();
  const preview = useMemo(
    () => (corridor ? compareRoute(corridor, travellers, false) : null),
    [corridor, travellers],
  );
  const fastest = preview ? [...preview.modes].sort((a, b) => a.minutes_door - b.minutes_door)[0] : null;
  const cheapest = preview ? [...preview.modes].sort((a, b) => a.cash_eur - b.cash_eur)[0] : null;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!to) return;
    router.push(`/tripcost/${from}/to/${to}?travellers=${travellers}`);
  }

  return (
    <section className="tc-atlas">
      <RouteMap from={from} to={to} mode={preview?.best} />
      <form onSubmit={onSubmit} className="tc-atlas-ui">
        <div className="tc-atlas-pair">
          <p>
            <span>From</span>
            <strong>{fromName}</strong>
          </p>
          <p>
            <span>To</span>
            <strong>{toName}</strong>
          </p>
        </div>
        {corridor && preview ? (
          <ul className="tc-atlas-decisions" aria-label="Trip comparison">
            {preview.modes.filter((mode) => mode.available).map((mode) => (
              <li key={mode.mode} data-mode={mode.mode} className={mode.mode === preview.best ? "is-best" : ""}>
                <span>{LABELS[mode.mode]}</span>
                <b>€{mode.cash_eur}</b>
                <small>{fmtDoor(mode.minutes_door)}</small>
              </li>
            ))}
          </ul>
        ) : null}
        {cheapest && fastest ? (
          <p className="sr-only">
            Cheapest modelled cash is {LABELS[cheapest.mode]} at €{cheapest.cash_eur}. Fastest is {LABELS[fastest.mode]} in {fmtDoor(fastest.minutes_door)}.
          </p>
        ) : null}
        <button className="tc-cta" type="submit">Open comparison</button>
        <p className="tc-atlas-note">Modelled prices · not live fares · corridor is not a road route</p>
      </form>
    </section>
  );
}
