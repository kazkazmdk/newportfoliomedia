"use client";

import { useState } from "react";
import type { ChargerPort } from "@penta/chargematch";

export function ExpertToggle({
  chargerName,
  pd,
  ports,
}: {
  chargerName: string;
  pd: string;
  ports: ChargerPort[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-8">
      <button type="button" className="text-sm underline" onClick={() => setOpen((v) => !v)}>
        {open ? "Hide" : "Expert mode"}
      </button>
      {open ? (
        <div className="cm-box mt-3 p-4 text-sm leading-6">
          <p>
            {chargerName} · {pd}
          </p>
          {ports.map((p) => (
            <p key={p.id} className="cm-mono mt-2">
              {p.label}: {p.pdos.map((pdo) => `${pdo.volts}V/${pdo.amps}A ${pdo.watts}W`).join(" · ")}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
