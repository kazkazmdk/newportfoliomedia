import { ROUTES } from "@penta/tripcost";
import { nodeOf } from "./map-nodes";

export function RouteMap({ from, to }: { from?: string; to?: string }) {
  const active = from && to ? { from, to } : undefined;
  const nodes = Array.from(new Set(ROUTES.flatMap((r) => [r.from.slug, r.to.slug])));
  return (
    <div className="tc-map" aria-hidden={false}>
      <svg viewBox="0 0 340 300" role="img" aria-label="Schematic route map">
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
          return (
            <g key={slug}>
              <circle cx={p.x} cy={p.y} r={hot ? 4.5 : 2.4} className="tc-city" />
              <text x={p.x + 6} y={p.y - 6} fontSize="8" fill="currentColor">
                {slug}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
