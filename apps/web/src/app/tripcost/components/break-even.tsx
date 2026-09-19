"use client";

type Row = { travellers: number; cheaper: string; carCash: number; trainCash: number; evCash?: number };

export function BreakEvenChart({ rows }: { rows: Row[] }) {
  if (!rows.length) return null;
  const maxY = Math.max(...rows.flatMap((r) => [r.carCash, r.trainCash, r.evCash ?? 0]), 1);
  const w = 640;
  const h = 280;
  const pad = 36;
  const x = (n: number) => pad + ((n - 1) / 5) * (w - pad * 2);
  const y = (v: number) => h - pad - (v / maxY) * (h - pad * 2);
  const line = (key: "carCash" | "trainCash" | "evCash") =>
    rows
      .map((r, i) => {
        const v = r[key];
        if (v == null) return "";
        return `${i === 0 ? "M" : "L"} ${x(r.travellers)} ${y(v)}`;
      })
      .join(" ");
  const cross = rows.find((r, i) => i > 0 && rows[i - 1].cheaper !== r.cheaper);
  return (
    <div className="tc-be">
      {cross ? (
        <p className="tc-be-event">
          <span>{cross.travellers} {cross.travellers === 1 ? "person" : "people"}</span>
          <strong>{cross.cheaper === "car" ? "Car becomes cheaper" : "Train stays cheaper"}</strong>
        </p>
      ) : null}
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Break-even cost by traveller count">
        <path d={line("carCash")} className="tc-be-car" />
        <path d={line("trainCash")} className="tc-be-train" />
        {rows.some((r) => r.evCash != null) ? <path d={line("evCash")} className="tc-be-ev" /> : null}
        {rows.map((r) => (
          <text key={r.travellers} x={x(r.travellers)} y={h - 10} fontSize="11" textAnchor="middle" fill="currentColor">
            {r.travellers}
          </text>
        ))}
        {cross ? (
          <g>
            <circle cx={x(cross.travellers)} cy={y(cross.carCash)} r="5" fill="#e23b2e" />
            <text x={x(cross.travellers) + 10} y={y(cross.carCash) - 10} fontSize="12">
              Break-even · {cross.travellers} travellers
            </text>
          </g>
        ) : null}
      </svg>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--tc-mute)]">Travellers 1 → 6 · total cash</p>
    </div>
  );
}
