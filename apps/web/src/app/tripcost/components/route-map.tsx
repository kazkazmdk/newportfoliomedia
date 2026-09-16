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
  const lift = mode === "flight" ? 96 : mode === "train" ? 28 : 42;
  return (
    <CursorCanvas label="Route" color="#0a1628" className={`tc-map${compact ? " is-compact" : ""}`}>
      <svg viewBox="0 0 1000 720" role="img" aria-label="Geographic route representation of the selected corridor">
        <rect width="1000" height="720" fill="#b7c4d0" />
        <path d={EUROPE_LAND} fill="#d4dce4" stroke="#0a1628" strokeWidth="1.4" />
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
              opacity={on ? 0 : 0.16}
            />
          );
        })}
        {a && b ? <path d={geodesic(a, b, lift)} className={`tc-path is-${mode}`} /> : null}
        {nodes.map((slug) => {
          const p = pointOf(slug);
          const hot = slug === from || slug === to;
          return (
            <g key={slug}>
              <circle cx={p.x} cy={p.y} r={hot ? 7 : 2.5} className="tc-city" />
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
      <p className="tc-map-note">Geographic positions · geodesic representation — not turn-by-turn roads</p>
    </CursorCanvas>
  );
}
