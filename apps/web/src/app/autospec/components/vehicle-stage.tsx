"use client";

import Image from "next/image";
import { useState } from "react";
import { autospecAssetOf } from "@/lib/autospec-assets";
import { vehicleMediaOf } from "@/lib/media-catalog";

const ZONES = ["body", "engine", "tyres", "battery", "service"] as const;
export type VehicleFocus = (typeof ZONES)[number];

export type VehicleSceneSpec = {
  engineCode?: string;
  oilLiters?: number;
  oilSpec?: string;
  tyreFront?: string;
  tyreRear?: string;
  batteryType?: string;
  serviceLabel?: string;
};

export function VehicleStage({
  focus = "body",
  makeSlug,
  generationSlug,
  identity,
  spec,
}: {
  focus?: VehicleFocus;
  makeSlug?: string;
  generationSlug?: string;
  identity?: string;
  spec?: VehicleSceneSpec;
}) {
  const [zone, setZone] = useState<VehicleFocus>(focus);
  const media = makeSlug && generationSlug ? vehicleMediaOf(makeSlug, generationSlug) : vehicleMediaOf("bmw", "g20");
  const assets = makeSlug && generationSlug ? autospecAssetOf(makeSlug, generationSlug) : autospecAssetOf("bmw", "g20");

  return (
    <div className="as-stage" data-zone={zone} data-visual-status={assets?.status ?? "WEAK"}>
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
          </div>
        ) : (
          <p className="text-sm text-[var(--as-mute)]">No licensed vehicle still for this identity. Silhouette withheld.</p>
        )}
        {zone !== "body" ? (
          <aside className={`as-plate is-${zone}`} aria-live="polite">
            {zone === "engine" ? (
              <>
                <p>Engine system</p>
                <strong>{spec?.engineCode ?? "Graph identity"}</strong>
                <small>{spec?.oilLiters ? `${spec.oilLiters} L · ${spec.oilSpec ?? "oil spec"}` : "No oil volume on file"}</small>
                <svg viewBox="0 0 220 80" className="as-plate-diagram" aria-hidden>
                  <rect x="18" y="22" width="120" height="36" rx="4" />
                  <circle cx="170" cy="40" r="16" />
                  <path d="M138 40 H154 M186 40 H206" />
                </svg>
              </>
            ) : null}
            {zone === "tyres" ? (
              <>
                <p>Fitment</p>
                <strong>{spec?.tyreFront ?? "—"}</strong>
                <small>{spec?.tyreRear && spec.tyreRear !== spec.tyreFront ? `Rear ${spec.tyreRear}` : "Same axle spec"}</small>
                <svg viewBox="0 0 220 80" className="as-plate-diagram" aria-hidden>
                  <circle cx="56" cy="40" r="26" />
                  <circle cx="56" cy="40" r="12" />
                  <circle cx="164" cy="40" r="26" />
                  <circle cx="164" cy="40" r="12" />
                </svg>
              </>
            ) : null}
            {zone === "battery" ? (
              <>
                <p>12V system</p>
                <strong>{spec?.batteryType ? `12V ${spec.batteryType}` : "Unknown"}</strong>
                <small>Graph reference · no live voltage</small>
                <svg viewBox="0 0 220 80" className="as-plate-diagram" aria-hidden>
                  <rect x="60" y="18" width="100" height="46" rx="4" />
                  <path d="M88 18 V10 H108 V18 M112 18 V10 H132 V18" />
                </svg>
              </>
            ) : null}
            {zone === "service" ? (
              <>
                <p>Ownership interval</p>
                <strong>{spec?.serviceLabel ?? "Unknown until mileage"}</strong>
                <small>Scheduled · not remaining kilometres</small>
                <svg viewBox="0 0 220 80" className="as-plate-diagram" aria-hidden>
                  <path d="M16 48 H204" />
                  <circle cx="28" cy="48" r="5" />
                  <circle cx="110" cy="48" r="5" />
                  <circle cx="196" cy="48" r="5" />
                  <text x="20" y="28">NOW</text>
                  <text x="188" y="28">LATER</text>
                </svg>
              </>
            ) : null}
          </aside>
        ) : null}
      </div>
      <div className="as-zone-rail" aria-label="Inspect vehicle systems">
        {ZONES.map((z) => (
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
          Static licensed image. System plates are graph identity, not live telemetry or an X-ray.
        </p>
      </details>
    </div>
  );
}
