"use client";

import { VEHICLES, assistantAnswer, getVehicle, nextService, ownershipScore, vehicleUrl } from "@penta/autospec";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Feedback } from "@/components/feedback";
import { IdentityStrip } from "./components/identity-strip";
import { OwnershipTimeline } from "./components/ownership-timeline";
import { VehicleStage } from "./components/vehicle-stage";

export function GarageApp() {
  const params = useSearchParams();
  const vehicle = getVehicle(
    params.get("make") ?? "bmw",
    params.get("model") ?? "3-series",
    params.get("gen") ?? "g20",
    params.get("var") ?? "320d-b47",
  );
  const [km] = useState(87432);
  const [question, setQuestion] = useState("What oil should I buy?");
  const [answer, setAnswer] = useState("");

  const score = useMemo(
    () =>
      ownershipScore({
        km,
        last_oil_km: 76200,
        tyre_ok: true,
        brake_pct: 72,
        battery: "GOOD",
        open_recalls: 0,
      }),
    [km],
  );

  if (!vehicle) {
    return <p className="as-scene">We don&apos;t have verified data for that vehicle yet.</p>;
  }

  const due = nextService(vehicle, km, 48);

  return (
    <div>
      <section className="as-hero">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em]">My Garage · private · noindex</p>
          <h1 className="mt-4 text-5xl leading-[0.9] md:text-7xl">
            {vehicle.make} {vehicle.variant}
          </h1>
          <p className="mt-3 text-lg text-[var(--as-mute)]">
            {km.toLocaleString()} km · {vehicle.engine_code} · {vehicle.years[0]}–{vehicle.years.at(-1)}
          </p>
          <p className="as-display mt-8 text-6xl">{score.score}/100</p>
          <ul className="mt-4 grid gap-1 text-sm">
            {score.factors.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <VehicleStage />
      </section>
      <IdentityStrip vehicle={vehicle} />
      <section className="as-scene">
        <p className="text-[11px] uppercase tracking-[0.2em]">Fleet</p>
        <ul className="mt-6 grid gap-3 md:grid-cols-3">
          {VEHICLES.slice(0, 3).map((v) => (
            <li key={v.id}>
              <Link href={`/autospec/garage?make=${v.make_slug}&model=${v.model_slug}&gen=${v.generation_slug}&var=${v.variant_slug}`} className="as-tile">
                <p className="text-[11px] uppercase tracking-[0.16em]">{v.generation}</p>
                <p className="as-display text-3xl">{v.make} {v.variant}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="as-scene">
        <OwnershipTimeline items={due} />
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
          <input className="border-b border-[var(--as-ink)] bg-transparent py-2" value={question} onChange={(e) => setQuestion(e.target.value)} />
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
