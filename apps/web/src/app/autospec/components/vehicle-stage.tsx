"use client";

import { useState } from "react";

const ZONES = ["body", "engine", "tyres", "battery", "service"] as const;

export function VehicleStage({ focus = "body" }: { focus?: (typeof ZONES)[number] }) {
  const [zone, setZone] = useState<(typeof ZONES)[number]>(focus);
  return (
    <div className="as-stage">
      <svg className="as-car" viewBox="0 0 640 240" role="img" aria-label="Vehicle silhouette">
        <path d="M70 168 H112 C132 168 148 118 188 108 C214 72 248 58 292 56 H404 C458 56 492 78 524 112 C556 120 580 138 592 154 V176 H70 Z" />
        <path d="M214 108 C236 78 260 62 292 60 H390 C430 62 456 82 478 108" />
        <path d="M292 60 V108 M390 62 V108 M248 108 H470" />
        <circle className={zone === "tyres" ? "hot" : ""} cx="176" cy="176" r="26" />
        <circle cx="176" cy="176" r="11" />
        <circle className={zone === "tyres" ? "hot" : ""} cx="500" cy="176" r="26" />
        <circle cx="500" cy="176" r="11" />
        <rect className={zone === "engine" ? "hot" : ""} x="124" y="122" width="58" height="26" />
        <rect className={zone === "battery" ? "hot" : ""} x="318" y="154" width="44" height="14" />
        <path className={zone === "service" ? "hot" : ""} d="M318 78 H392" />
        <path d="M70 168 H592" />
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
