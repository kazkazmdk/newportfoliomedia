"use client";

import { ROUTES } from "@penta/tripcost";
import { CursorCanvas } from "@/components/creative";
import { EUROPE_LAND, geodesic, pointOf } from "./geo";

export function RouteMap({
  from,
  to,
  mode = "train",
}: {
  from?: string;
  to?: string;
  mode?: string;
}) {
  const nodes = Array.from(new Set(ROUTES.flatMap((r) => [r.from.slug, r.to.slug])));
  const a = from ? pointOf(from) : null;
  const b = to ? pointOf(to) : null;
  const lift = mode === "flight" ? 96 : mode === "train" ? 28 : 42;
  return (
    <CursorCanvas label="Route" color="#0a1628" className="tc-map">
      <svg viewBox="0 0 1000 720" role="img" aria-label="Geographic route representation">
        <rect width="1000" height="720" fill="#9fb0c0" />
        <path d={EUROPE_LAND} fill="#c9d3dc" stroke="#0a1628" strokeWidth="1.1" />
        {ROUTES.map((r) => {
          const p = pointOf(r.from.slug);
          const q = pointOf(r.to.slug);
          const on = from && to && r.from.slug === from && r.to.slug === to;
          return (
            <path
              key={r.id}
              d={geodesic(p, q, on ? lift : 36)}
              className={on ? "tc-path" : "tc-path-draw"}
              opacity={on ? 1 : 0.22}
            />
          );
        })}
        {a && b ? (
          <path d={geodesic(a, b, lift)} className={`tc-path is-${mode}`} />
        ) : null}
        {nodes.map((slug) => {
          const p = pointOf(slug);
          const hot = slug === from || slug === to;
          return (
            <g key={slug}>
              <circle cx={p.x} cy={p.y} r={hot ? 6 : 3} className="tc-city" />
              <text x={p.x + 8} y={p.y - 8} fontSize="13" fill="currentColor">
                {slug.replaceAll("-", " ")}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="tc-map-note">Geographic positions · geodesic route representation — not turn-by-turn roads</p>
    </CursorCanvas>
  );
}
