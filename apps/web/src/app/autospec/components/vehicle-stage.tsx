"use client";

import { useState } from "react";

const ZONES = ["body", "engine", "tyres", "battery", "service"] as const;

export function VehicleStage({ focus = "body" }: { focus?: (typeof ZONES)[number] }) {
  const [zone, setZone] = useState<(typeof ZONES)[number]>(focus);
  return (
    <div className="as-stage">
      <svg className="as-car" viewBox="0 0 640 240" role="img" aria-label="Vehicle silhouette">
        <path d="M86 150 H120 C150 150 168 96 210 92 H410 C460 92 486 128 522 140 H574 V168 H86 Z" />
        <path d="M210 92 L236 58 H392 L430 92" />
        <path d="M250 58 V92 M360 58 V92" />
        <circle className={zone === "tyres" ? "hot" : ""} cx="176" cy="168" r="28" />
        <circle cx="176" cy="168" r="12" />
        <circle className={zone === "tyres" ? "hot" : ""} cx="500" cy="168" r="28" />
        <circle cx="500" cy="168" r="12" />
        <rect className={zone === "engine" ? "hot" : ""} x="132" y="108" width="62" height="28" />
        <rect className={zone === "battery" ? "hot" : ""} x="300" y="150" width="46" height="16" />
        <path className={zone === "service" ? "hot" : ""} d="M300 70 H360" />
      </svg>
      <div className="mt-6 flex flex-wrap gap-3">
        {ZONES.filter((z) => z !== "body").map((z) => (
          <button
            key={z}
            type="button"
            className="text-[10px] uppercase tracking-[0.2em]"
            onClick={() => setZone(z)}
            style={{ color: zone === z ? "var(--as-metal)" : "inherit" }}
          >
            {z}
          </button>
        ))}
      </div>
    </div>
  );
}
