"use client";

import { breakEvenByTravellers, compareRoute, costLabel, timeValueBreakEven, type RouteRecord } from "@penta/tripcost";
import { useMemo, useState } from "react";
import { Feedback } from "@/components/feedback";

const LABELS: Record<string, string> = {
  car: "Car",
  ev: "EV",
  train: "Train",
  bus: "Bus",
  flight: "Flight",
  rideshare: "Rideshare",
};

function fmt(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export function RouteCompare({ route }: { route: RouteRecord }) {
  const [travellers, setTravellers] = useState(4);
  const [trueCost, setTrueCost] = useState(false);
  const [fuel, setFuel] = useState(route.fuel_eur_per_l);
  const [parking, setParking] = useState(route.parking_eur);
  const [tolls, setTolls] = useState(route.tolls_eur);
  const adjusted = useMemo(
    () => ({ ...route, fuel_eur_per_l: fuel, parking_eur: parking, tolls_eur: tolls }),
    [route, fuel, parking, tolls],
  );
  const result = useMemo(() => compareRoute(adjusted, travellers, trueCost), [adjusted, travellers, trueCost]);
  const table = useMemo(() => breakEvenByTravellers(adjusted), [adjusted]);
  const train = result.modes.find((m) => m.mode === "train");
  const car = result.modes.find((m) => m.mode === "car");
  const be = train && car ? timeValueBreakEven(train, car) : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl">
            {route.from.name} → {route.to.name}
          </h1>
          <p className="mt-2 text-[#3d4f63]">{route.km} km · cash vs true cost · {costLabel("HEURISTIC")} — not a live ticket</p>
        </div>
        <p className="tc-card px-4 py-3">
          Best value: <strong>{LABELS[result.best]}</strong>
        </p>
      </div>
      <p className="mt-4 text-sm text-[#3d4f63]">
        Cash = fuel + tolls + parking. True cost adds wear. Train/bus/flight figures are typical estimates, not current tickets.
      </p>
      <label className="mt-8 grid max-w-md gap-2 text-sm">
        Travellers
        <input type="range" min={1} max={6} value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} />
        <span className="tc-mono text-lg">{travellers}</span>
      </label>
      <div className="mt-4 grid max-w-xl gap-3 text-sm md:grid-cols-3">
        <label>
          Fuel €/L
          <input className="mt-1 w-full border px-2 py-1" type="number" step="0.05" value={fuel} onChange={(e) => setFuel(Number(e.target.value))} />
        </label>
        <label>
          Parking €
          <input className="mt-1 w-full border px-2 py-1" type="number" step="1" value={parking} onChange={(e) => setParking(Number(e.target.value))} />
        </label>
        <label>
          Tolls €
          <input className="mt-1 w-full border px-2 py-1" type="number" step="1" value={tolls} onChange={(e) => setTolls(Number(e.target.value))} />
        </label>
      </div>
      <ul className="mt-4 text-sm leading-7">
        {table.map((row) => (
          <li key={row.travellers}>
            {row.travellers} traveller{row.travellers > 1 ? "s" : ""}: {row.cheaper === "car" ? "driving cheaper" : "train cheaper"}
            {row.carCash === row.trainCash ? " (roughly equal)" : ""}
          </li>
        ))}
      </ul>
      {result.cheaper_from ? (
        <p className="mt-3">
          Driving becomes cheaper than {result.cheaper_from.vs} from {result.cheaper_from.from_travellers} travellers.
        </p>
      ) : null}
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={trueCost} onChange={(e) => setTrueCost(e.target.checked)} />
        Show true cost (wear). Cash cost stays the default figure.
      </label>
      <ul className="mt-8 grid gap-3">
        {result.modes.map((m) => (
          <li key={m.mode} className={`tc-card p-5 ${m.mode === result.best ? "ring-2 ring-[#0b3a6a]" : ""}`}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="text-xl">{LABELS[m.mode]}</p>
              <p className="tc-mono text-3xl">
              {m.stale ? "—" : `€${trueCost ? m.true_eur : m.cash_eur}`}
            </p>
            </div>
            {m.stale ? (
              <p className="mt-2 text-sm">
                Fare unavailable as current. Last observed: €{m.cash_eur} ({m.retrieved_at.slice(0, 10)}).
              </p>
            ) : (
              <p className="mt-2 text-sm">
                {costLabel("HEURISTIC")} €{m.per_person_cash}/person · door-to-door {fmt(m.minutes_door)} · in-vehicle {fmt(m.minutes_in_vehicle)}
              </p>
            )}
            <ul className="mt-3 grid gap-1 text-sm text-[#3d4f63]">
              {m.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs uppercase tracking-wide">{m.confidence} confidence</p>
          </li>
        ))}
      </ul>
      {be !== null ? (
        <p className="mt-6 tc-card p-4">
          Train costs more. Break-even time value ≈ €{be}/hour versus car for this party size.
        </p>
      ) : null}
      <div className="mt-10">
        <Feedback site="tripcost" />
      </div>
    </div>
  );
}
