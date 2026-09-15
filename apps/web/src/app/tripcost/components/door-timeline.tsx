function fmt(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export type DoorSegment = { id: string; label: string; minutes: number };

export function DoorToDoorTimeline({
  rows,
}: {
  rows: Array<{ mode: string; label: string; minutes: number; win?: boolean; segments?: DoorSegment[] }>;
}) {
  const max = Math.max(...rows.map((r) => r.minutes), 1);
  return (
    <div className="tc-time">
      {rows.map((row) => {
        const segs = row.segments?.filter((s) => s.minutes > 0) ?? [{ id: "all", label: row.label, minutes: row.minutes }];
        const sum = segs.reduce((n, s) => n + s.minutes, 0) || 1;
        return (
          <div key={row.mode} className={row.win ? "is-win" : ""}>
            <div className="flex justify-between text-sm">
              <span>{row.label}</span>
              <span className="tc-mono">{fmt(row.minutes)}</span>
            </div>
            <div className="tc-seg mt-2" style={{ width: `${(row.minutes / max) * 100}%` }}>
              {segs.map((seg) => (
                <span key={seg.id} style={{ flex: seg.minutes / sum }} title={`${seg.label} ${seg.minutes} min`}>
                  {seg.label}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
