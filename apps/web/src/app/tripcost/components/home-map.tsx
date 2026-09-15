"use client";

import { PLACES, ROUTES } from "@penta/tripcost";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { RouteMap } from "./route-map";

export function HomeMap() {
  const router = useRouter();
  const [from, setFrom] = useState("paris");
  const [to, setTo] = useState("lyon");
  const [travellers, setTravellers] = useState(4);

  const origins = useMemo(
    () => PLACES.filter((p) => ROUTES.some((r) => r.from.slug === p.slug)),
    [],
  );
  const destinations = useMemo(() => ROUTES.filter((r) => r.from.slug === from).map((r) => r.to), [from]);
  const dest = destinations.some((p) => p.slug === to) ? to : destinations[0]?.slug;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!dest) return;
    router.push(`/tripcost/${from}/to/${dest}?travellers=${travellers}`);
  }

  return (
    <section className="tc-hero">
      <RouteMap from={from} to={dest} />
      <form onSubmit={onSubmit} className="tc-form">
        <label>
          From
          <select
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
          To
          <select value={dest} onChange={(e) => setTo(e.target.value)}>
            {destinations.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Travellers · {travellers}
          <input type="range" min={1} max={5} value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} />
        </label>
        <button className="tc-cta" type="submit">
          Draw the cost
        </button>
      </form>
    </section>
  );
}
