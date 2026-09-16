"use client";

import { scheduledIntervalCopy, serviceIntervalLabel } from "@penta/autospec";

type Item = {
  id: string;
  name: string;
  spec?: string;
  interval_km: number;
  interval_months: number;
  km_left?: number | null;
  months_left?: number | null;
};

export function OwnershipTimeline({
  items,
  mode = "scheduled",
}: {
  items: Item[];
  mode?: "interval" | "scheduled";
}) {
  if (!items.length) {
    return <p className="text-sm text-[var(--as-mute)]">No service interval rows on file for this identity.</p>;
  }
  return (
    <div className="as-timeline">
      <p className="text-[11px] uppercase tracking-[0.2em]">{mode === "interval" ? "Typical intervals" : "Scheduled intervals"}</p>
      {items.map((item, index) => (
        <div key={item.id} className={`as-tl ${index === 0 ? "is-now" : ""}`}>
          <p className="as-tl-km">
            {mode === "interval" || item.km_left == null
              ? serviceIntervalLabel(item)
              : scheduledIntervalCopy(item.km_left)}
          </p>
          <div>
            <p className={index === 0 ? "as-display text-3xl" : ""}>{item.name}</p>
            <p className="mt-1 text-sm text-[var(--as-mute)]">
              {item.spec ?? "Inspect"}
              {` · every ${item.interval_months} months`}
              {mode === "scheduled" ? " · based on the standard interval" : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
