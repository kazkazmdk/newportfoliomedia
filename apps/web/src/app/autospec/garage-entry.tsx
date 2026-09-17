"use client";

import { VIN_SUPPORT, decodeVin, findVehicles } from "@penta/autospec";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export function GarageEntry() {
  const router = useRouter();
  const [q, setQ] = useState("320d");
  const [vin, setVin] = useState("");
  const [note, setNote] = useState("");
  const hits = useMemo(() => findVehicles(q), [q]);

  async function onVin(event: FormEvent) {
    event.preventDefault();
    const result = await decodeVin(vin);
    setNote(result.notes.join(" "));
    if (result.vehicle) {
      router.push(
        `/autospec/garage?make=${result.vehicle.make_slug}&model=${result.vehicle.model_slug}&gen=${result.vehicle.generation_slug}&var=${result.vehicle.variant_slug}`,
      );
    }
  }

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
        {hits.slice(0, 4).map((v) => (
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
        <summary>
          VIN identification
          <span>Unavailable · support status: {VIN_SUPPORT}</span>
        </summary>
        <form onSubmit={onVin} className="mt-3 grid gap-2">
          <label className="as-field">
            VIN
            <input aria-label="VIN support check" value={vin} onChange={(e) => setVin(e.target.value)} placeholder="17 characters" />
          </label>
          <button className="as-ghost-action" type="submit">
            Check support status
          </button>
          {note ? <p className="text-sm text-[var(--as-mute)]">{note}</p> : null}
        </form>
      </details>
    </div>
  );
}
