"use client";

import { serviceIntervalLabel } from "@penta/autospec";

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
  mode = "remaining",
}: {
  items: Item[];
  mode?: "interval" | "remaining";
}) {
  if (!items.length) {
    return <p className="text-sm text-[var(--as-mute)]">No service interval rows on file for this identity.</p>;
  }
  return (
    <div className="as-timeline">
      <p className="text-[11px] uppercase tracking-[0.2em]">{mode === "interval" ? "Typical intervals" : "Remaining"}</p>
      {items.map((item, index) => (
        <div key={item.id} className={`as-tl ${index === 0 ? "is-now" : ""}`}>
          <p className="as-tl-km">
            {mode === "interval" || item.km_left == null
              ? serviceIntervalLabel(item)
              : `${item.km_left.toLocaleString()} km remaining`}
          </p>
          <div>
            <p className={index === 0 ? "as-display text-3xl" : ""}>{item.name}</p>
            <p className="mt-1 text-sm text-[var(--as-mute)]">
              {item.spec ?? "Inspect"}
              {mode === "remaining" && item.months_left != null ? ` · ${item.months_left} months` : ` · every ${item.interval_months} months`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
