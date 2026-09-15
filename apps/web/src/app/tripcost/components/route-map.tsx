import { ROUTES } from "@penta/tripcost";
import { nodeOf } from "./map-nodes";

export function RouteMap({ from, to }: { from?: string; to?: string }) {
  const active = from && to ? { from, to } : undefined;
  const nodes = Array.from(new Set(ROUTES.flatMap((r) => [r.from.slug, r.to.slug])));
  return (
    <div className="tc-map" aria-hidden={false}>
      <svg viewBox="40 70 250 190" role="img" aria-label="Schematic route map">
        {ROUTES.map((r) => {
          const a = nodeOf(r.from.slug);
          const b = nodeOf(r.to.slug);
          const on = active && r.from.slug === from && r.to.slug === to;
          return (
            <line
              key={r.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={on ? "tc-path" : "tc-path-draw"}
              opacity={on ? 1 : 0.28}
            />
          );
        })}
        {nodes.map((slug) => {
          const p = nodeOf(slug);
          const hot = slug === from || slug === to;
          const label = slug.replaceAll("-", " ");
          return (
            <g key={slug}>
              <circle cx={p.x} cy={p.y} r={hot ? 5.2 : 2.6} className="tc-city" />
              <text x={p.x + 7} y={p.y - 7} fontSize="9" fill="currentColor">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
