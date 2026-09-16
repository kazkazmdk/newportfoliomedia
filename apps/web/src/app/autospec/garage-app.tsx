"use client";

import {
  assistantAnswer,
  getVehicle,
  kmUntilNextFromLast,
  nextService,
  ownershipCoverage,
  ownershipScore,
  scheduledIntervalCopy,
  vehicleUrl,
} from "@penta/autospec";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Feedback } from "@/components/feedback";
import { IdentityStrip } from "./components/identity-strip";
import { OwnershipTimeline } from "./components/ownership-timeline";
import { VehicleStage } from "./components/vehicle-stage";

function sanitizeKm(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(2_000_000, n);
}

function tyreLabel(tyreChecked: boolean, tyreOk: boolean | undefined) {
  if (!tyreChecked) return "Not checked";
  if (tyreOk == null) return "Tyre result missing";
  return tyreOk ? "Inspected OK" : "Needs attention";
}

export function GarageApp() {
  const router = useRouter();
  const params = useSearchParams();
  const vehicle = getVehicle(
    params.get("make") ?? "bmw",
    params.get("model") ?? "3-series",
    params.get("gen") ?? "g20",
    params.get("var") ?? "320d-b47",
  );
  const km = sanitizeKm(params.get("km"));
  const [kmDraft, setKmDraft] = useState(km != null ? String(km) : "");
  const [lastOilKm, setLastOilKm] = useState<number | undefined>();
  const [tyreChecked, setTyreChecked] = useState(false);
  const [tyreOk, setTyreOk] = useState<boolean | undefined>();
  const [brakePct, setBrakePct] = useState<number | undefined>();
  const [battery, setBattery] = useState<"GOOD" | "WEAK" | "UNKNOWN" | undefined>();
  const [question, setQuestion] = useState("What oil should I buy?");
  const [answer, setAnswer] = useState("");

  const coverage = useMemo(
    () =>
      ownershipCoverage({
        km: km ?? undefined,
        last_oil_km: lastOilKm,
        tyre_checked: tyreChecked,
        tyre_ok: tyreOk,
        brake_pct: brakePct,
        battery,
      }),
    [km, lastOilKm, tyreChecked, tyreOk, brakePct, battery],
  );

  const score = useMemo(() => {
    if (!coverage.ready || km == null || lastOilKm == null || tyreOk == null || brakePct == null || !battery || battery === "UNKNOWN") {
      return null;
    }
    return ownershipScore({
      km,
      last_oil_km: lastOilKm,
      tyre_ok: tyreOk,
      brake_pct: brakePct,
      battery,
      open_recalls: null,
    });
  }, [coverage.ready, km, lastOilKm, tyreOk, brakePct, battery]);

  if (!vehicle) {
    return <p className="as-scene">We don&apos;t have verified data for that vehicle yet.</p>;
  }

  const due = km != null ? nextService(vehicle, km) : [];
  const nextScheduled = due[0];
  const oilRow = vehicle.services.find((s) => s.id === "oil");
  const oilUntil =
    km != null && lastOilKm != null && oilRow
      ? kmUntilNextFromLast(km, lastOilKm, oilRow.interval_km)
      : null;

  function saveMileage(event: FormEvent) {
    event.preventDefault();
    const next = sanitizeKm(kmDraft);
    if (next == null) return;
    const q = new URLSearchParams(params.toString());
    q.set("km", String(next));
    router.replace(`/autospec/garage?${q.toString()}`, { scroll: false });
  }

  return (
    <div>
      <section className="as-hero">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em]">My Garage · this session · noindex</p>
          <h1 className="mt-4 text-5xl leading-[0.9] md:text-7xl">
            {vehicle.make} {vehicle.variant}
          </h1>
          <p className="mt-3 text-lg text-[var(--as-mute)]">
            {vehicle.engine_code} · {vehicle.years[0]}–{vehicle.years.at(-1)}
            {km != null ? ` · ${km.toLocaleString()} km entered` : ""}
          </p>
          {km == null ? (
            <form className="mt-6 grid max-w-sm gap-3" onSubmit={saveMileage}>
              <label className="as-field">
                Current mileage
                <input
                  type="number"
                  min={1}
                  max={2000000}
                  inputMode="numeric"
                  aria-label="Current mileage in kilometres"
                  placeholder="e.g. 42000"
                  value={kmDraft}
                  onChange={(e) => setKmDraft(e.target.value)}
                  required
                />
              </label>
              <button className="as-cta w-fit" type="submit">
                Use this mileage
              </button>
            </form>
          ) : null}
          <div className="as-cockpit">
            <div className="as-cockpit-cell">
              <p>Next scheduled interval</p>
              <strong>
                {nextScheduled ? scheduledIntervalCopy(nextScheduled.km_left) : "Enter mileage"}
              </strong>
            </div>
            <div className="as-cockpit-cell">
              <p>Oil</p>
              <strong>{vehicle.oil.capacity_liters ? `${vehicle.oil.spec} · ${vehicle.oil.capacity_liters} L` : "EV — none"}</strong>
            </div>
            <div className="as-cockpit-cell">
              <p>Tyres</p>
              <strong>{tyreLabel(tyreChecked, tyreOk)}</strong>
            </div>
            <div className="as-cockpit-cell">
              <p>Battery</p>
              <strong>{battery && battery !== "UNKNOWN" ? battery : "Not checked"}</strong>
            </div>
            <div className="as-cockpit-cell">
              <p>Recalls</p>
              <strong>VIN required</strong>
            </div>
          </div>
          {km != null ? (
            <p className="mt-3 text-sm text-[var(--as-mute)]">Based on the standard maintenance interval. Assumes the maintenance schedule has been followed.</p>
          ) : null}
          {oilUntil != null && lastOilKm != null && oilRow ? (
            <div className="mt-6" data-oil-known>
              <p className="text-[11px] uppercase tracking-[0.18em]">Oil service</p>
              <p className="as-display mt-2 text-3xl">
                {oilUntil === 0 ? "Oil service due now" : `${oilUntil.toLocaleString()} km until next oil change`}
              </p>
              <p className="mt-2 text-sm text-[var(--as-mute)]">
                Last oil change entered at {lastOilKm.toLocaleString()} km.
              </p>
            </div>
          ) : null}
          <p className="as-display mt-8 text-5xl">{coverage.completed} / {coverage.total} checks completed</p>
          <ul className="mt-4 grid gap-1 text-sm">
            {coverage.checks.map((c) => (
              <li key={c.id}>
                {c.label}: {c.done ? "entered" : c.id === "tyres" && tyreChecked && tyreOk == null ? "Tyre result missing" : "not entered"}
              </li>
            ))}
          </ul>
          {score ? (
            <div data-ownership-score>
              <p className="as-display mt-6 text-5xl">{score.score}/100</p>
              <p className="mt-2 text-sm">Based on {coverage.completed} entered checks.</p>
              <ul className="mt-4 grid gap-1 text-sm">
                {score.factors.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--as-mute)]">
              Ownership score stays hidden until mileage, last oil, tyres, brakes and battery are all entered. No default health values. Recall status is not included.
            </p>
          )}
        </div>
        <VehicleStage makeSlug={vehicle.make_slug} generationSlug={vehicle.generation_slug} identity={`${vehicle.make} ${vehicle.variant} ${vehicle.generation}`} />
      </section>
      <IdentityStrip vehicle={vehicle} />
      <section className="as-scene">
        {km != null ? (
          <OwnershipTimeline items={due} mode="scheduled" />
        ) : (
          <OwnershipTimeline items={vehicle.services} mode="interval" />
        )}
        <details className="as-vin mt-10">
          <summary>
            Optional ownership checks
            <span>Only values you enter are used. Nothing is pre-filled.</span>
          </summary>
          <div className="mt-4 grid max-w-lg gap-3">
            <label className="as-field">
              Last oil change (km)
              <input
                type="number"
                min={0}
                aria-label="Odometer at last oil change"
                value={lastOilKm ?? ""}
                onChange={(e) => setLastOilKm(e.target.value === "" ? undefined : Number(e.target.value))}
              />
            </label>
            <label className="as-field">
              Brake pad estimate (%)
              <input
                type="number"
                min={0}
                max={100}
                aria-label="Brake pad remaining percent"
                value={brakePct ?? ""}
                onChange={(e) => setBrakePct(e.target.value === "" ? undefined : Number(e.target.value))}
              />
            </label>
            <label className="as-field">
              12V battery
              <select
                className="border-b border-[var(--as-ink)] bg-transparent py-2"
                aria-label="12V battery condition"
                value={battery ?? ""}
                onChange={(e) => setBattery((e.target.value || undefined) as "GOOD" | "WEAK" | "UNKNOWN" | undefined)}
              >
                <option value="">Not checked</option>
                <option value="GOOD">Good</option>
                <option value="WEAK">Weak</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={tyreChecked}
                onChange={(e) => {
                  setTyreChecked(e.target.checked);
                  if (!e.target.checked) setTyreOk(undefined);
                }}
              />
              Tyres inspected
            </label>
            {tyreChecked ? (
              <fieldset className="grid gap-2">
                <legend className="text-[11px] uppercase tracking-[0.16em]">Tyre condition</legend>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="tyre-condition"
                    checked={tyreOk === true}
                    onChange={() => setTyreOk(true)}
                  />
                  OK
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="tyre-condition"
                    checked={tyreOk === false}
                    onChange={() => setTyreOk(false)}
                  />
                  Needs attention
                </label>
              </fieldset>
            ) : null}
          </div>
        </details>
        {vehicle.issues.length ? (
          <ul className="mt-10 grid gap-3">
            {vehicle.issues.map((issue) => (
              <li key={issue.id} className="border-b border-[var(--as-line)] py-4">
                <p>{issue.title}</p>
                <p className="mt-2 text-sm leading-6">{issue.summary}</p>
                <p className="mt-2 text-sm text-[#7a2e2e]">{issue.when_to_stop}</p>
              </li>
            ))}
          </ul>
        ) : null}
        <ul className="mt-8 grid gap-3">
          {vehicle.recalls.map((r) => (
            <li key={r.id} className="border-b border-[var(--as-line)] py-4">
              <p>{r.title}</p>
              <p className="mt-2 text-sm">{r.status} — VIN specific. We do not guess a clean bill of health.</p>
              <a className="mt-2 inline-block text-sm underline" href={r.source_url}>
                Official portal
              </a>
            </li>
          ))}
        </ul>
        <form
          className="mt-10 grid max-w-lg gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setAnswer(assistantAnswer(vehicle, question));
          }}
        >
          <label className="as-field">
            Ask from the vehicle graph
            <input className="border-b border-[var(--as-ink)] bg-transparent py-2" value={question} onChange={(e) => setQuestion(e.target.value)} />
          </label>
          <button className="as-cta w-fit" type="submit">
            Answer from the vehicle graph
          </button>
        </form>
        {answer ? <p className="mt-4 max-w-xl leading-7">{answer}</p> : null}
        <Link className="mt-8 inline-block text-sm underline" href={vehicleUrl(vehicle)}>
          Open public identity
        </Link>
        <div className="mt-10">
          <Feedback site="autospec" />
        </div>
      </section>
    </div>
  );
}
