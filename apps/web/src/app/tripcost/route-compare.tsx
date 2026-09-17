"use client";

import { breakEvenByTravellers, compareRoute, costLabel, routeCosts, sanitizeTravellers, timeValueBreakEven, type RouteRecord } from "@penta/tripcost";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Feedback } from "@/components/feedback";
import { BreakEvenChart } from "./components/break-even";
import { CostRace } from "./components/cost-race";
import { DoorToDoorTimeline } from "./components/door-timeline";
import { RouteMap } from "./components/route-map";

const LABELS: Record<string, string> = {
  car: "Car",
  ev: "EV",
  train: "Train",
  bus: "Bus",
  flight: "Flight",
  rideshare: "Rideshare",
};

export function RouteCompare({ route, initialTravellers }: { route: RouteRecord; initialTravellers?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const travellers = sanitizeTravellers(searchParams.get("travellers") ?? initialTravellers);
  const [trueCost, setTrueCost] = useState(false);
  const [fuel, setFuel] = useState(route.fuel_eur_per_l);
  const [parking, setParking] = useState(route.parking_eur);
  const [tolls, setTolls] = useState(route.tolls_eur);

  function setTravellers(next: number) {
    const value = sanitizeTravellers(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("travellers", String(value));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const adjusted = useMemo(
    () => ({ ...route, fuel_eur_per_l: fuel, parking_eur: parking, tolls_eur: tolls }),
    [route, fuel, parking, tolls],
  );
  const result = useMemo(() => compareRoute(adjusted, travellers, trueCost), [adjusted, travellers, trueCost]);
  const table = useMemo(() => breakEvenByTravellers(adjusted), [adjusted]);
  const train = result.modes.find((m) => m.mode === "train");
  const car = result.modes.find((m) => m.mode === "car");
  const be = train && car ? timeValueBreakEven(train, car) : null;
  const costs = routeCosts(route);
  const fastest = [...result.modes].sort((a, b) => a.minutes_door - b.minutes_door)[0];
  const cheapest = [...result.modes].sort((a, b) => a.cash_eur - b.cash_eur)[0];
  const trueBest = [...result.modes].sort((a, b) => a.true_eur - b.true_eur)[0];
  const partyBest = result.best;
  const fmtDoor = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${m} min`;
  };

  return (
    <div>
      <section className="tc-hero is-result tc-result-hero">
        <div className="tc-result-intro">
          <p className="tc-kicker">Corridor comparison · {route.km} km</p>
          <p>One journey, measured across cash, total time and group size.</p>
        </div>
        <RouteMap from={route.from.slug} to={route.to.slug} mode={result.best} />
        <div className="tc-form tc-result-form">
          <div>
            <p className="tc-kicker">A → B · this corridor</p>
            <h1 className="mt-1 text-3xl md:text-4xl">
              {route.from.name} → {route.to.name}
            </h1>
          </div>
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
          <div className="tc-result-status">
            <span>Current signal</span>
            <strong>Best for {travellers} · {LABELS[partyBest]}</strong>
          </div>
        </div>
        <div className="tc-verdicts" aria-label="Trip comparison">
          {fastest ? (
            <div className="tc-verdict" data-verdict="fastest">
              <p>Fastest</p>
              <strong>{LABELS[fastest.mode]} · {fmtDoor(fastest.minutes_door)}</strong>
            </div>
          ) : null}
          {cheapest ? (
            <div className="tc-verdict" data-verdict="cheapest">
              <p>Cheapest cash</p>
              <strong>{LABELS[cheapest.mode]} · €{cheapest.cash_eur}</strong>
            </div>
          ) : null}
          {trueBest ? (
            <div className="tc-verdict" data-verdict="true-cost">
              <p>True cost</p>
              <strong>{LABELS[trueBest.mode]} · €{trueBest.true_eur}</strong>
            </div>
          ) : null}
          {partyBest ? (
            <div className="tc-verdict" data-verdict="best">
              <p>Best for {travellers} {travellers === 1 ? "person" : "people"}</p>
              <strong>{LABELS[partyBest]}</strong>
            </div>
          ) : null}
        </div>
        <div className="tc-source-strip">
          <p>
            <span>Model</span>
            <strong>{costLabel("HEURISTIC")}</strong>
          </p>
          <p>
            <span>Fare status</span>
            <strong>Typical estimates · not live tickets</strong>
          </p>
          <p>
            <span>Map status</span>
            <strong>Geodesic diagram · not road routing</strong>
          </p>
          <a href="#assumptions">Inspect assumptions ↓</a>
        </div>
      </section>
      <section className="tc-scene">
        <p className="tc-section-index tc-mono">01 / Decision</p>
        <h2 className="tc-scene-title">Best option for this trip</h2>
        <p className="mt-4 text-5xl">{LABELS[result.best]}</p>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--tc-mute)]">
          Cash = fuel + tolls + parking. True cost adds wear. Train/bus/flight figures are typical estimates, not current tickets.
        </p>
      </section>
      <section className="tc-scene">
        <p className="tc-section-index tc-mono">02 / Time</p>
        <h2 className="tc-scene-title">Door to door</h2>
        <div className="mt-6">
          <DoorToDoorTimeline
            rows={result.modes.map((m) => ({
              mode: m.mode,
              label: LABELS[m.mode],
              minutes: m.minutes_door,
              win: fastest?.mode === m.mode,
              segments:
                m.mode === "flight"
                  ? [
                      { id: "access", label: "Access", minutes: route.airport_access_minutes },
                      { id: "sec", label: "Security", minutes: route.security_buffer_minutes },
                      { id: "fly", label: "Flight", minutes: route.flight_minutes },
                      { id: "city", label: "City", minutes: route.city_transfer_minutes },
                    ]
                  : m.mode === "train"
                    ? [
                        { id: "access", label: "Access", minutes: 20 },
                        { id: "station", label: "Station", minutes: 10 },
                        { id: "train", label: "Train", minutes: route.train_minutes },
                        { id: "arr", label: "Arrival", minutes: 10 },
                      ]
                    : m.mode === "ev"
                      ? [
                          { id: "drive", label: "Drive", minutes: Math.max(m.minutes_door - route.ev_charge_minutes, 0) },
                          { id: "charge", label: "Charge", minutes: route.ev_charge_minutes },
                        ]
                      : m.mode === "car" || m.mode === "rideshare"
                        ? [{ id: "drive", label: "Drive", minutes: m.minutes_door }]
                        : [
                            { id: "access", label: "Access", minutes: 15 },
                            { id: "bus", label: "Coach", minutes: route.bus_minutes },
                            { id: "arr", label: "Arrival", minutes: 15 },
                          ],
            }))}
          />
        </div>
      </section>
      <section className="tc-scene">
        <p className="tc-section-index tc-mono">03 / Cost</p>
        <h2 className="tc-scene-title">Cash cost</h2>
        <div className="mt-6">
          <CostRace
            best={result.best}
            rows={result.modes.map((m) => ({
              mode: m.mode,
              label: LABELS[m.mode],
              cash: trueCost ? m.true_eur : m.cash_eur,
              trueCost: m.true_eur,
              stale: m.stale,
            }))}
          />
        </div>
      </section>
      <section className="tc-scene">
        <p className="tc-section-index tc-mono">04 / Model</p>
        <h2 className="tc-scene-title">Adjust the assumptions</h2>
        <p className="tc-scene-deck">Change the inputs, not the evidence status. Every result below remains a modelled estimate.</p>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={trueCost} onChange={(e) => setTrueCost(e.target.checked)} />
          Show true cost (wear). Cash cost stays the default figure.
        </label>
        <div className="mt-6 grid max-w-xl gap-3 text-sm md:grid-cols-3">
          <label>
            Fuel €/L
            <input className="mt-1 w-full border-b border-[var(--tc-ink)] bg-transparent py-1" type="number" step="0.05" value={fuel} onChange={(e) => setFuel(Number(e.target.value))} />
          </label>
          <label>
            Parking €
            <input className="mt-1 w-full border-b border-[var(--tc-ink)] bg-transparent py-1" type="number" step="1" value={parking} onChange={(e) => setParking(Number(e.target.value))} />
          </label>
          <label>
            Tolls €
            <input className="mt-1 w-full border-b border-[var(--tc-ink)] bg-transparent py-1" type="number" step="1" value={tolls} onChange={(e) => setTolls(Number(e.target.value))} />
          </label>
        </div>
      </section>
      <section className="tc-scene">
        <p className="tc-section-index tc-mono">05 / Group</p>
        <h2 className="tc-scene-title">When driving becomes cheaper</h2>
        <BreakEvenChart
          rows={table.map((row) => {
            const ev = compareRoute(adjusted, row.travellers, false).modes.find((m) => m.mode === "ev");
            return { ...row, evCash: ev?.cash_eur };
          })}
        />
        <ul className="mt-6 max-w-xl text-lg leading-9">
          {table.map((row) => (
            <li key={row.travellers}>
              {row.travellers} traveller{row.travellers > 1 ? "s" : ""}: {row.cheaper === "car" ? "driving cheaper" : "train cheaper"}
              {row.carCash === row.trainCash ? " (roughly equal)" : ""}
            </li>
          ))}
        </ul>
        {result.cheaper_from ? (
          <p className="mt-4">
            Driving becomes cheaper than {result.cheaper_from.vs} from {result.cheaper_from.from_travellers} travellers.
          </p>
        ) : null}
        {be !== null ? (
          <p className="mt-4">Train costs more. Break-even time value ≈ €{be}/hour versus car for this party size.</p>
        ) : null}
      </section>
      <section className="tc-scene" id="assumptions">
        <p className="tc-section-index tc-mono">06 / Evidence</p>
        <h2 className="tc-scene-title">Assumptions and provenance</h2>
        <p className="tc-scene-deck">The model says what it knows. These labels describe the evidence behind each cost input.</p>
        <ul className="tc-evidence-grid">
          <li><span>Fuel</span><strong>{costLabel(costs.fuel.evidence)}</strong><small>{costs.fuel.evidence}</small></li>
          <li><span>Tolls</span><strong>{costLabel(costs.tolls.evidence)}</strong><small>{costs.tolls.evidence}</small></li>
          <li><span>Parking</span><strong>{costLabel(costs.parking.evidence)}</strong><small>{costs.parking.evidence}</small></li>
          <li><span>Train</span><strong>{costLabel(costs.train.evidence)}</strong><small>{costs.train.evidence}</small></li>
        </ul>
        <ul className="tc-assumption-list">
          {result.modes.map((m) => (
            <li key={m.mode}>
              <p>
                {LABELS[m.mode]} · {m.stale ? "fare unavailable as current" : m.price_kind === "HEURISTIC_PRICE" ? "Typical estimate" : m.price_kind.replaceAll("_", " ")}
                {" — "}
                not a live ticket · €{m.per_person_cash}/person · {m.confidence} confidence
              </p>
              <ul>
                {m.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Feedback site="tripcost" />
        </div>
      </section>
    </div>
  );
}
