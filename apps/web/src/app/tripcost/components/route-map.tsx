"use client";

import { ROUTES } from "@penta/tripcost";
import { CursorCanvas } from "@/components/creative";
import { EUROPE_LAND, geodesic, pointOf } from "./geo";

export function RouteMap({
  from,
  to,
  mode = "train",
  compact = false,
}: {
  from?: string;
  to?: string;
  mode?: string;
  compact?: boolean;
}) {
  const nodes = Array.from(new Set(ROUTES.flatMap((r) => [r.from.slug, r.to.slug])));
  const a = from ? pointOf(from) : null;
  const b = to ? pointOf(to) : null;
  const fromName = ROUTES.flatMap((r) => [r.from, r.to]).find((place) => place.slug === from)?.name;
  const toName = ROUTES.flatMap((r) => [r.from, r.to]).find((place) => place.slug === to)?.name;
  const lift = mode === "flight" ? 96 : mode === "train" ? 28 : 42;
  return (
    <CursorCanvas label="Route" color="#0a1628" className={`tc-map${compact ? " is-compact" : ""}`}>
      <div className="tc-map-meta" aria-hidden="true">
        <span>Europe / corridor study</span>
        <span className="tc-mono">Geodesic 01</span>
      </div>
      <svg viewBox="0 0 1000 720" role="img" aria-labelledby="tc-map-title tc-map-desc">
        <title id="tc-map-title">{fromName && toName ? `${fromName} to ${toName}` : "TripCost corridor map"}</title>
        <desc id="tc-map-desc">
          Schematic geographic representation using a geodesic line between cities. It is not a road route or turn-by-turn itinerary.
        </desc>
        <rect width="1000" height="720" fill="#e7e1d4" />
        <g className="tc-map-grid" aria-hidden="true">
          <path d="M 0 180 H 1000 M 0 360 H 1000 M 0 540 H 1000" />
          <path d="M 250 0 V 720 M 500 0 V 720 M 750 0 V 720" />
        </g>
        <path d={EUROPE_LAND} fill="#c5d0d8" stroke="#1a2a3c" strokeWidth="1.1" />
        {ROUTES.map((r) => {
          const p = pointOf(r.from.slug);
          const q = pointOf(r.to.slug);
          const on = from && to && r.from.slug === from && r.to.slug === to;
          return (
            <path
              key={r.id}
              d={geodesic(p, q, on ? lift : 28)}
              className={on ? undefined : "tc-path-draw"}
              stroke={on ? "transparent" : "#0a1628"}
              strokeWidth={on ? 0 : 1}
              opacity={on ? 0 : 0.05}
            />
          );
        })}
        {a && b ? (
          <>
            <path d={geodesic(a, b, lift)} className="tc-path-halo" aria-hidden="true" />
            <path d={geodesic(a, b, lift)} className={`tc-path is-${mode}`} />
          </>
        ) : null}
        {nodes.map((slug) => {
          const p = pointOf(slug);
          const hot = slug === from || slug === to;
          const endpoint = slug === from ? "A" : slug === to ? "B" : null;
          return (
            <g key={slug}>
              {hot ? <circle cx={p.x} cy={p.y} r="15" className="tc-city-ring" /> : null}
              <circle cx={p.x} cy={p.y} r={hot ? 6 : 2.5} className="tc-city" />
              {endpoint ? (
                <text x={p.x} y={p.y + 3.5} className="tc-endpoint" textAnchor="middle">
                  {endpoint}
                </text>
              ) : null}
              {hot || ["paris", "lyon", "london", "berlin", "madrid", "rome", "amsterdam"].includes(slug) ? (
                <text
                  x={p.x + 9}
                  y={p.y - 8}
                  fontSize={hot ? 15 : 11}
                  fontWeight={hot ? 600 : 400}
                  fill="#0a1628"
                >
                  {slug.replaceAll("-", " ")}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div className="tc-map-caption">
        <p className="tc-map-note">
          Schematic geographic positions · geodesic connection only · not a road route or turn-by-turn itinerary
        </p>
        <p className="tc-map-legend" aria-hidden="true">
          <span><i /> Selected corridor</span>
          <span><i /> Available studies</span>
        </p>
      </div>
    </CursorCanvas>
  );
}
