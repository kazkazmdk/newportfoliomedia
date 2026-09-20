"use client";

import Image from "next/image";
import { useState } from "react";
import { autospecAssetOf, autospecSystemMedia } from "@/lib/autospec-assets";
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
  const system = zone === "body" ? null : autospecSystemMedia(zone);
  const activeSrc = zone === "body" ? media?.src : system?.src;
  const activeAlt = zone === "body" ? (media?.alt ?? "") : (system?.note ?? "");

  return (
    <div className="as-stage" data-zone={zone} data-visual-status={assets?.status ?? "WEAK"}>
      <div className="as-depth">
        <div className="as-plane" aria-hidden />
        {activeSrc ? (
          <div className={`as-car-photo ${zone !== "body" ? "is-inspect is-system" : ""}`}>
            <Image
              src={activeSrc}
              alt={activeAlt}
              width={1800}
              height={860}
              sizes="(max-width: 800px) 100vw, 80vw"
              className="as-car-img"
              priority
            />
            <div className="as-shadow" aria-hidden />
            {system ? <p className="as-class-label">{system.label}</p> : null}
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
              </>
            ) : null}
            {zone === "tyres" ? (
              <>
                <p>Fitment</p>
                <strong>{spec?.tyreFront ?? "—"}</strong>
                <small>{spec?.tyreRear && spec.tyreRear !== spec.tyreFront ? `Rear ${spec.tyreRear}` : "Same axle spec"}</small>
              </>
            ) : null}
            {zone === "battery" ? (
              <>
                <p>12V system</p>
                <strong>{spec?.batteryType ? `12V ${spec.batteryType}` : "Unknown"}</strong>
                <small>Graph reference · no live voltage</small>
              </>
            ) : null}
            {zone === "service" ? (
              <>
                <p>Ownership interval</p>
                <strong>{spec?.serviceLabel ?? "Unknown until mileage"}</strong>
                <small>Scheduled · not remaining kilometres</small>
              </>
            ) : null}
          </aside>
        ) : null}
      </div>
      <div className="as-zone-rail" aria-label="Inspect vehicle systems">
        {ZONES.map((item) => (
          <button key={item} type="button" aria-pressed={zone === item} onClick={() => setZone(item)}>
            {item}
          </button>
        ))}
      </div>
      <details className="as-source as-stage-truth">
        <summary>Data & source</summary>
        <p>
          {identity ?? "BMW 320d G20"}
          {media ? ` · ${media.note}` : ""}
          {system ? ` · ${system.note}` : " · Static licensed body image."}
          {" · Graph identity remains the data source. System photography is a class reference, not an X-ray of the selected vehicle."}
        </p>
      </details>
    </div>
  );
}
