"use client";

import { VIN_SUPPORT, findVehicles } from "@penta/autospec";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function GarageEntry() {
  const router = useRouter();
  const [q, setQ] = useState("320d");
  const hits = useMemo(() => findVehicles(q), [q]);

  return (
    <div className="as-garage-entry">
      <div className="as-search-row">
        <label className="as-field">
          Make / model / generation
          <input aria-label="Search make and model" value={q} onChange={(e) => setQ(e.target.value)} placeholder="BMW 320d G20" />
        </label>
        <span className="as-search-count" aria-live="polite">{hits.length} covered matches</span>
      </div>
      <ul className="as-search-results" aria-label="Covered vehicle matches">
        {hits.length === 0 ? (
          <li className="as-search-empty">Not on file. We will not guess a fitment.</li>
        ) : hits.slice(0, 4).map((v) => (
          <li key={v.id}>
            <button
              type="button"
              className="as-search-hit"
              onClick={() =>
                router.push(
                  `/autospec/garage?make=${v.make_slug}&model=${v.model_slug}&gen=${v.generation_slug}&var=${v.variant_slug}`,
                )
              }
            >
              <span>
                <b>{v.make} {v.variant}</b>
                <small>{v.generation} · {v.engine_code}</small>
              </span>
              <span aria-hidden>Add ↗</span>
            </button>
          </li>
        ))}
      </ul>
      <details className="as-vin">
        <summary>VIN identification unavailable · stub</summary>
        <p>VIN {VIN_SUPPORT}. No decode field is offered on this surface.</p>
      </details>
    </div>
  );
}
