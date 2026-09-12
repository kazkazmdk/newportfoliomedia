"use client";

import { assistantAnswer, getVehicle, nextService, ownershipScore } from "@penta/autospec";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Feedback } from "@/components/feedback";

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
  const [tab, setTab] = useState("Overview");

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
    return <p>We don&apos;t have verified data for that vehicle yet.</p>;
  }

  const due = nextService(vehicle, km, 48);
  const tabs = ["Overview", "Maintenance", "Parts", "Problems", "Recalls", "History", "Costs", "Assistant"];

  return (
    <div>
      <p className="text-xs tracking-[0.18em] uppercase">My Garage · private · noindex</p>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <h1 className="text-5xl md:text-6xl">
            {vehicle.make} {vehicle.variant} {vehicle.generation}
          </h1>
          <p className="mt-3 text-lg text-[#5c564c]">
            {km.toLocaleString()} km · {vehicle.engine_code} · years {vehicle.years[0]}–{vehicle.years.at(-1)} share this page
          </p>
        </div>
        <div className="as-panel p-6">
          <p className="text-xs uppercase tracking-[0.16em]">Road-trip readiness</p>
          <p className="mt-2 font-[family-name:var(--font-as-display)] text-5xl">{score.score}/100</p>
          <ul className="mt-4 grid gap-1 text-sm">
            {score.factors.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-10 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`px-3 py-2 text-sm ${tab === item ? "bg-[#1b242c] text-[#efe8dc]" : "as-panel"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "Overview" || tab === "Maintenance" ? (
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {due.map((item) => (
            <li key={item.id} className="as-panel p-5">
              <p className="text-sm text-[#6a6258]">{item.name}</p>
              <p className="mt-1 text-2xl">{item.spec ?? "Inspect"}</p>
              <p className="mt-2 text-sm">Next in {item.km_left.toLocaleString()} km / {item.months_left} months</p>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "Problems" ? (
        <ul className="mt-8 grid gap-3">
          {vehicle.issues.length ? (
            vehicle.issues.map((issue) => (
              <li key={issue.id} className="as-panel p-5">
                <p>{issue.title}</p>
                <p className="mt-2 text-sm leading-6">{issue.summary}</p>
                <p className="mt-2 text-sm text-[#7a2e2e]">{issue.when_to_stop}</p>
              </li>
            ))
          ) : (
            <li>No structured known issues in this batch.</li>
          )}
        </ul>
      ) : null}
      {tab === "Recalls" ? (
        <ul className="mt-8 grid gap-3">
          {vehicle.recalls.map((r) => (
            <li key={r.id} className="as-panel p-5">
              <p>{r.title}</p>
              <p className="mt-2 text-sm">{r.status} — VIN specific. We do not guess a clean bill of health.</p>
              <a className="mt-2 inline-block text-sm underline" href={r.source_url}>
                Official portal
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "History" ? (
        <section className="mt-8 as-panel p-5">
          <h2 className="text-xl">Invoice scan</h2>
          <p className="mt-2 text-sm leading-6">
            Upload a garage invoice. We will ask you to confirm date, mileage, and operations before anything is stored.
          </p>
          <input type="file" accept="image/*,.pdf" className="mt-3 block text-sm" />
        </section>
      ) : null}
      {tab === "Assistant" || tab === "Overview" ? (
        <section className="mt-8 as-panel p-5">
          <h2 className="text-xl">Ask</h2>
          <form
            className="mt-3 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setAnswer(assistantAnswer(vehicle, question));
            }}
          >
            <input className="border border-[#d9d0c0] bg-transparent px-3 py-2" value={question} onChange={(e) => setQuestion(e.target.value)} />
            <button className="as-cta w-fit" type="submit">
              Answer from the vehicle graph
            </button>
          </form>
          {answer ? <p className="mt-4 leading-7">{answer}</p> : null}
        </section>
      ) : null}
      <div className="mt-10">
        <Feedback site="autospec" />
      </div>
    </div>
  );
}
