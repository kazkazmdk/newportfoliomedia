function fmt(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export function DoorToDoorTimeline({
  rows,
}: {
  rows: Array<{ mode: string; label: string; minutes: number; win?: boolean }>;
}) {
  const max = Math.max(...rows.map((r) => r.minutes), 1);
  return (
    <div className="tc-time">
      {rows.map((row) => (
        <div key={row.mode}>
          <div className="flex justify-between text-sm">
            <span>{row.label}</span>
            <span className="tc-mono">{fmt(row.minutes)}</span>
          </div>
          <div className={`tc-bar mt-2 ${row.win ? "is-win" : ""}`}>
            <span style={{ width: `${(row.minutes / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
