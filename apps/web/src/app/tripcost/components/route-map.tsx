"use client";

import { ROUTES } from "@penta/tripcost";
import { CursorCanvas } from "@/components/creative";
import { EUROPE_LAND, geodesic, pointOf } from "./geo";

const MAJOR = ["paris", "lyon", "london", "berlin", "madrid", "rome", "amsterdam"];

function placeName(slug?: string) {
  if (!slug) return "";
  return ROUTES.flatMap((r) => [r.from, r.to]).find((place) => place.slug === slug)?.name ?? slug.replaceAll("-", " ");
}

function contextualCorridors(from?: string, to?: string) {
  if (!from || !to) return [];
  const a = pointOf(from);
  const b = pointOf(to);
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  return ROUTES
    .filter((r) => !r.compare_only && !(r.from.slug === from && r.to.slug === to))
    .map((r) => {
      const p = pointOf(r.from.slug);
      const q = pointOf(r.to.slug);
      const related = r.from.slug === from || r.from.slug === to || r.to.slug === from || r.to.slug === to;
      const dist = Math.hypot((p.x + q.x) / 2 - midX, (p.y + q.y) / 2 - midY);
      return { r, related, dist };
    })
    .sort((left, right) => {
      if (left.related !== right.related) return left.related ? -1 : 1;
      return left.dist - right.dist;
    })
    .slice(0, 4)
    .map((row) => row.r);
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
  const context = contextualCorridors(from, to);
  const nodes = Array.from(new Set([...MAJOR, ...(from ? [from] : []), ...(to ? [to] : [])]));
  const a = from ? pointOf(from) : null;
  const b = to ? pointOf(to) : null;
  const fromName = placeName(from);
  const toName = placeName(to);
  const lift = mode === "flight" ? 108 : mode === "train" ? 22 : 40;
  return (
    <CursorCanvas label="Route" color="#0a1628" className={`tc-map${compact ? " is-compact" : ""}`} data-mode={mode} data-best-mode={mode}>
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
        {context.map((r) => {
          const p = pointOf(r.from.slug);
          const q = pointOf(r.to.slug);
          return (
            <path
              key={r.id}
              d={geodesic(p, q, 18)}
              className="tc-path-context"
              stroke="#0a1628"
              strokeWidth={1}
              opacity={0.12}
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
              </>
            ) : null}
            {mode === "car" || mode === "bus" ? (
              <circle className="tc-station" cx={b.x + 14} cy={b.y + 12} r="5" />
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
                <text x={p.x + 10} y={p.y - (hot ? 18 : 8)} className={`tc-city-label ${rank}`}>
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
          {context.length ? <span><i /> Nearby studies</span> : null}
          {mode === "car" && tollsModelled ? <span className="is-schematic">TOLL COST MODELLED</span> : null}
          {mode === "ev" && evChargeModelled ? <span className="is-schematic">CHARGE STOPS MODELLED · schematic</span> : null}
        </p>
      </div>
    </CursorCanvas>
  );
}
