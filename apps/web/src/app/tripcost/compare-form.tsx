"use client";

import { PLACES } from "@penta/tripcost";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CompareForm() {
  const router = useRouter();
  const [from, setFrom] = useState("paris");
  const [to, setTo] = useState("lyon");
  const [travellers, setTravellers] = useState(4);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(`/tripcost/${from}/to/${to}?travellers=${travellers}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-3 md:grid-cols-4">
      <label className="grid gap-1 text-sm">
        From
        <select className="tc-card px-3 py-3" value={from} onChange={(e) => setFrom(e.target.value)}>
          {PLACES.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        To
        <select className="tc-card px-3 py-3" value={to} onChange={(e) => setTo(e.target.value)}>
          {PLACES.map((p) => (
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
