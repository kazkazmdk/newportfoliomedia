import { AnimatedNumber } from "@/components/creative";

export function CostRace({
  rows,
  best,
}: {
  rows: Array<{ mode: string; label: string; cash: number; trueCost: number; stale?: boolean }>;
  best: string;
}) {
  const ordered = [...rows].sort((a, b) => a.cash - b.cash);
  const max = Math.max(...ordered.map((r) => Math.max(r.cash, r.trueCost)), 1);
  return (
    <div className="tc-race">
      {ordered.map((row) => (
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
