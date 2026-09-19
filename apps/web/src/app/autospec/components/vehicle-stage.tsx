"use client";

import Image from "next/image";
import { useState } from "react";
import { vehicleMediaOf } from "@/lib/media-catalog";

const ZONES = ["body", "engine", "tyres", "battery", "service"] as const;
export type VehicleFocus = (typeof ZONES)[number];

const CALLOUTS: Record<Exclude<VehicleFocus, "body">, { label: string; x: string; y: string; note: string }> = {
  engine: { label: "Engine", x: "22%", y: "40%", note: "Front system · graph identity" },
  tyres: { label: "Tyres", x: "18%", y: "74%", note: "Wheel region on this still" },
  battery: { label: "Battery", x: "76%", y: "38%", note: "Adjacent panel · not an X-ray" },
  service: { label: "Service", x: "68%", y: "16%", note: "Ownership interval" },
};

export function VehicleStage({
  focus = "body",
  makeSlug,
  generationSlug,
  identity,
}: {
  focus?: VehicleFocus;
  makeSlug?: string;
  generationSlug?: string;
  identity?: string;
}) {
  const [zone, setZone] = useState<VehicleFocus>(focus);
  const media = makeSlug && generationSlug ? vehicleMediaOf(makeSlug, generationSlug) : vehicleMediaOf("bmw", "g20");
  const call = zone === "body" ? null : CALLOUTS[zone];

  return (
    <div className="as-stage" data-zone={zone}>
      <div className="as-depth">
        <div className="as-plane" aria-hidden />
        {media ? (
          <div className={`as-car-photo ${zone !== "body" ? "is-inspect" : ""}`}>
            <Image
              src={media.src}
              alt={media.alt}
              width={1800}
              height={860}
              sizes="(max-width: 800px) 100vw, 80vw"
              className="as-car-img"
              priority
            />
            <div className="as-shadow" aria-hidden />
            {call ? (
              <div className="as-callout" style={{ left: call.x, top: call.y }}>
                <span />
                <p>
                  {call.label}
                  <small>{call.note}</small>
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[var(--as-mute)]">No licensed vehicle still for this identity. Silhouette withheld.</p>
        )}
      </div>
      <div className="as-zone-rail" aria-label="Inspect vehicle systems">
        {ZONES.filter((z) => z !== "body").map((z) => (
          <button key={z} type="button" aria-pressed={zone === z} onClick={() => setZone(z)}>
            {z}
          </button>
        ))}
      </div>
      <details className="as-source as-stage-truth">
        <summary>Data & source</summary>
        <p>
          {identity ?? "BMW 320d G20"}
          {media ? ` · ${media.note}` : ""}
          {" · "}
          Static licensed image. Markers are contextual, not live telemetry.
        </p>
      </details>
    </div>
  );
}
