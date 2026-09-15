import { AnimatedNumber } from "@/components/creative";

export function CostRace({
  rows,
  best,
}: {
  rows: Array<{ mode: string; label: string; cash: number; trueCost: number; stale?: boolean }>;
  best: string;
}) {
  const max = Math.max(...rows.map((r) => Math.max(r.cash, r.trueCost)), 1);
  return (
    <div className="tc-race">
      {rows.map((row) => (
        <div key={row.mode} className={`tc-mode ${row.mode === best ? "is-win" : ""}`}>
          <p>{row.label}</p>
          <div className="tc-bar">
            <span style={{ width: `${(row.cash / max) * 100}%` }} />
          </div>
          <p className="tc-mono text-2xl">
            {row.stale ? "—" : <AnimatedNumber value={row.cash} prefix="€" />}
          </p>
        </div>
      ))}
    </div>
  );
}
