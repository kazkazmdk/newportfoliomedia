"use client";

import dynamic from "next/dynamic";
import { ROUTES } from "@penta/tripcost";
import { corridorKind } from "./geo";

const RealWorldMap = dynamic(
  () => import("./real-map").then((mod) => mod.RealWorldMap),
  { ssr: false, loading: () => <div className="tc-realmap-state"><span>Loading world map</span></div> },
);

function placeName(slug?: string) {
  if (!slug) return "";
  return ROUTES.flatMap((route) => [route.from, route.to]).find((place) => place.slug === slug)?.name ?? slug.replaceAll("-", " ");
}

export function RouteMap({
  from,
  to,
  mode = "train",
  compact = false,
  tollsModelled = false,
  evChargeModelled = false,
}: {
  from?: string;
  to?: string;
  mode?: string;
  compact?: boolean;
  tollsModelled?: boolean;
  evChargeModelled?: boolean;
}) {
  const corridor = corridorKind(mode);
  const fromName = placeName(from);
  const toName = placeName(to);
  return (
    <div className={`tc-map${compact ? " is-compact" : ""}`} data-mode={mode} data-best-mode={mode} data-map="world">
      <div className="tc-map-meta">
        <span>OpenStreetMap geography</span>
        <span className="tc-mono">{mode}</span>
      </div>
      <RealWorldMap from={from} to={to} mode={mode} fromName={fromName} toName={toName} />
      <div className="tc-map-caption">
        <p className="tc-map-note">
          {corridor.label} · {corridor.note}
        </p>
        <p className="tc-map-legend" aria-hidden="true">
          <span><i /> {corridor.label}</span>
          {mode === "car" && tollsModelled ? <span className="is-schematic">TOLL COST MODELLED</span> : null}
          {mode === "ev" && evChargeModelled ? <span className="is-schematic">CHARGE STOPS MODELLED · cost only</span> : null}
        </p>
      </div>
    </div>
  );
}
