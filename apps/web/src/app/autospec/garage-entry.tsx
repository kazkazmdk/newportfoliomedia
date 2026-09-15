"use client";

import { decodeVin, findVehicles } from "@penta/autospec";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export function GarageEntry() {
  const router = useRouter();
  const [q, setQ] = useState("BMW 320d");
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
    <div className="mt-10 grid max-w-md gap-5">
      <label className="as-field">
        Make / model / generation
        <input value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <ul className="grid gap-2">
        {hits.map((v) => (
          <li key={v.id}>
            <button
              type="button"
              className="as-cta"
              onClick={() =>
                router.push(
                  `/autospec/garage?make=${v.make_slug}&model=${v.model_slug}&gen=${v.generation_slug}&var=${v.variant_slug}`,
                )
              }
            >
              Add {v.make} {v.variant} {v.generation}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={onVin} className="grid gap-2">
        <label className="as-field">
          VIN
          <input value={vin} onChange={(e) => setVin(e.target.value)} placeholder="17 characters" />
        </label>
        <button className="justify-self-start border border-[var(--as-ink)] px-4 py-2 text-[11px] uppercase tracking-[0.16em]" type="submit">
          Decode VIN
        </button>
        {note ? <p className="text-sm text-[var(--as-mute)]">{note}</p> : null}
      </form>
    </div>
  );
}
