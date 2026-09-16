"use client";

import { PLACES, ROUTES } from "@penta/tripcost";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export function CompareForm() {
  const router = useRouter();
  const [from, setFrom] = useState("paris");
  const [to, setTo] = useState("lyon");
  const [travellers, setTravellers] = useState(2);

  const origins = useMemo(
    () => PLACES.filter((p) => ROUTES.some((r) => r.from.slug === p.slug)),
    [],
  );

  const destinations = useMemo(() => {
    return ROUTES.filter((r) => r.from.slug === from).map((r) => r.to);
  }, [from]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const dest = destinations.some((p) => p.slug === to) ? to : destinations[0]?.slug;
    if (!dest) return;
    router.push(`/tripcost/${from}/to/${dest}?travellers=${travellers}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-3 md:grid-cols-4">
      <label className="grid gap-1 text-sm">
        From
        <select className="tc-card px-3 py-3" value={from} onChange={(e) => {
          setFrom(e.target.value);
          const next = ROUTES.find((r) => r.from.slug === e.target.value);
          if (next) setTo(next.to.slug);
        }}>
          {origins.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        To
        <select className="tc-card px-3 py-3" value={destinations.some((p) => p.slug === to) ? to : destinations[0]?.slug} onChange={(e) => setTo(e.target.value)}>
          {destinations.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Travellers
        <input
          type="range"
          min={1}
          max={5}
          value={travellers}
          onChange={(e) => setTravellers(Number(e.target.value))}
        />
        <span className="tc-mono">{travellers}</span>
      </label>
      <button className="tc-cta self-end" type="submit">
        Compare the real cost
      </button>
    </form>
  );
}
