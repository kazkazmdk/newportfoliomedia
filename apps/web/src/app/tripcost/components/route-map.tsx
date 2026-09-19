"use client";

import { ROUTES } from "@penta/tripcost";
import { CursorCanvas } from "@/components/creative";
import { EUROPE_LAND, geodesic, pointOf } from "./geo";

const MAJOR = ["paris", "lyon", "london", "berlin", "madrid", "rome", "amsterdam"];

function placeName(slug?: string) {
  if (!slug) return "";
  return ROUTES.flatMap((r) => [r.from, r.to]).find((place) => place.slug === slug)?.name ?? slug.replaceAll("-", " ");
}

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
  const fromName = placeName(from);
  const toName = placeName(to);
  const lift = mode === "flight" ? 108 : mode === "train" ? 22 : 40;
  return (
    <CursorCanvas label="Route" color="#0a1628" className={`tc-map${compact ? " is-compact" : ""}`}>
      <div className="tc-map-meta" aria-hidden="true">
        <span>Western Europe / atlas</span>
        <span className="tc-mono">{mode}</span>
      </div>
      <svg viewBox="0 0 1000 720" role="img" aria-labelledby="tc-map-title tc-map-desc">
        <title id="tc-map-title">{fromName && toName ? `${fromName} to ${toName}` : "TripCost corridor map"}</title>
        <desc id="tc-map-desc">
          Schematic atlas using geodesic lines between cities. It is not a road route or turn-by-turn itinerary.
        </desc>
        <rect className="tc-water" width="1000" height="720" />
        <ellipse className="tc-water" cx="180" cy="620" rx="220" ry="80" opacity="0.35" />
        <path className="tc-land" d={EUROPE_LAND} />
        {a && b ? (
          <path
            className="tc-region"
            d={`M${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + 70} ${b.x} ${b.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 - 90} ${a.x} ${a.y} Z`}
          />
        ) : null}
        <text className="tc-country-label" x="430" y="310">France</text>
        <text className="tc-country-label" x="210" y="430">Iberia</text>
        {ROUTES.map((r) => {
          const p = pointOf(r.from.slug);
          const q = pointOf(r.to.slug);
          const on = from && to && r.from.slug === from && r.to.slug === to;
          return (
            <path
              key={r.id}
              d={geodesic(p, q, 24)}
              className={on ? undefined : "tc-path-draw"}
              stroke={on ? "transparent" : "#0a1628"}
              strokeWidth={on ? 0 : 1}
              opacity={on ? 0 : 0.04}
            />
          );
        })}
        {a && b ? (
          <>
            <path d={geodesic(a, b, lift)} className="tc-path-halo" aria-hidden="true" />
            <path d={geodesic(a, b, lift)} className={`tc-path is-${mode}`} />
            {mode === "train" ? (
              <>
                <circle className="tc-station" cx={a.x} cy={a.y} r="7" />
                <circle className="tc-station" cx={b.x} cy={b.y} r="7" />
                <circle className="tc-station" cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2 - lift * 0.45} r="3.5" />
              </>
            ) : null}
            {mode === "car" || mode === "bus" ? (
              <>
                <circle className="tc-toll" cx={(a.x * 2 + b.x) / 3} cy={(a.y * 2 + b.y) / 3 - 12} r="4" />
                <circle className="tc-station" cx={b.x + 14} cy={b.y + 12} r="5" />
              </>
            ) : null}
            {mode === "ev" ? (
              <>
                <circle className="tc-charge" cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2 - 18} r="5" />
                <circle className="tc-charge" cx={(a.x * 3 + b.x) / 4} cy={(a.y * 3 + b.y) / 4 - 8} r="4" />
              </>
            ) : null}
            {mode === "flight" ? (
              <>
                <rect className="tc-airport" x={a.x - 8} y={a.y - 8} width="16" height="16" />
                <rect className="tc-airport" x={b.x - 8} y={b.y - 8} width="16" height="16" />
              </>
            ) : null}
          </>
        ) : null}
        {nodes.map((slug) => {
          const p = pointOf(slug);
          const hot = slug === from || slug === to;
          const endpoint = slug === from ? "A" : slug === to ? "B" : null;
          const label = placeName(slug);
          const rank = hot ? "is-end" : MAJOR.includes(slug) ? "is-major" : "is-secondary";
          return (
            <g key={slug}>
              {hot ? <circle cx={p.x} cy={p.y} r="15" className="tc-city-ring" /> : null}
              <circle cx={p.x} cy={p.y} r={hot ? 6 : 2.5} className="tc-city" />
              {endpoint ? (
                <text x={p.x} y={p.y + 3.5} className="tc-endpoint" textAnchor="middle">
                  {endpoint}
                </text>
              ) : null}
              {hot || MAJOR.includes(slug) ? (
                <text x={p.x + 10} y={p.y - (hot ? 16 : 8)} className={`tc-city-label ${rank}`}>
                  {label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div className="tc-map-caption">
        <p className="tc-map-note">
          Atlas positions · geodesic corridor only · not a road route or turn-by-turn itinerary
        </p>
        <p className="tc-map-legend" aria-hidden="true">
          <span><i /> Selected corridor</span>
          <span><i /> Available studies</span>
        </p>
      </div>
    </CursorCanvas>
  );
}
