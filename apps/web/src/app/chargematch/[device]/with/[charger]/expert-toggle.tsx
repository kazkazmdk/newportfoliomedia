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
    <section className="cm-expert">
      <button
        type="button"
        className="cm-expert-toggle"
        aria-expanded={open}
        aria-controls="cm-expert-details"
        onClick={() => setOpen((value) => !value)}
      >
        <span>Expert mode</span>
        <span className="cm-mono">{open ? "Close" : "View PDOs"}</span>
      </button>
      {open ? (
        <div id="cm-expert-details" className="cm-expert-details">
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
