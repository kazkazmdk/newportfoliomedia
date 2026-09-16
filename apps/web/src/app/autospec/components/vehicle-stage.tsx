"use client";

import Image from "next/image";
import { useState } from "react";
import { CursorCanvas } from "@/components/creative";
import { vehicleMediaOf } from "@/lib/media-catalog";

const ZONES = ["body", "engine", "tyres", "battery", "service"] as const;
export type VehicleFocus = (typeof ZONES)[number];

const CALLOUTS: Record<Exclude<VehicleFocus, "body">, { label: string; x: string; y: string; note: string }> = {
  engine: { label: "Engine", x: "18%", y: "42%", note: "Front system · graph identity, not an X-ray of this photo" },
  tyres: { label: "Tyres", x: "22%", y: "78%", note: "Approximate wheel region on this body" },
  battery: { label: "Battery", x: "78%", y: "36%", note: "Adjacent panel — exact location is not drawn from this photo" },
  service: { label: "Service", x: "70%", y: "18%", note: "Ownership interval, not a body marker" },
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
    <CursorCanvas label="Inspect" color="#101418" className="as-stage">
      <div className="as-depth">
        <div className="as-plane" aria-hidden />
        {media ? (
          <div className={`as-car-photo ${zone !== "body" ? "is-inspect" : ""}`}>
            <Image
              src={media.src}
              alt={media.alt}
              width={1600}
              height={780}
              sizes="(max-width: 800px) 100vw, 68vw"
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
        <p className="as-credit">
          {identity ?? "BMW 320d G20"}
          {media ? ` · ${media.note}` : ""}
        </p>
      </div>
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
    </CursorCanvas>
  );
}
