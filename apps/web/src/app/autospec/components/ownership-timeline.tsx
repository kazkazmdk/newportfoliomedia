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
      <div className="as-timeline-heading">
        <div>
          <p className="as-eyebrow">Ownership timeline</p>
          <p className="as-display">{mode === "interval" ? "Typical intervals" : "Scheduled intervals"}</p>
        </div>
        <p>{mode === "interval" ? "Vehicle graph reference" : "Calculated from entered mileage · standard interval"}</p>
      </div>
      <ol>
        {items.map((item, index) => {
          const state = mode === "interval" || item.km_left == null
            ? "reference"
            : item.km_left <= 0
              ? "now"
              : index === 0 && item.km_left <= 5_000
                ? "soon"
                : "reference";
          return (
            <li key={item.id} className={`as-tl is-${state}`}>
              <div className="as-tl-rail" aria-hidden>
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="as-tl-status">
                <span className="as-state">{state}</span>
                <p className="as-tl-km">
                  {mode === "interval" || item.km_left == null
                    ? serviceIntervalLabel(item)
                    : scheduledIntervalCopy(item.km_left)}
                </p>
              </div>
              <div className="as-tl-content">
                <p>{item.name}</p>
                <p>
                  {item.spec ?? "Inspect"}
                  {` · every ${item.interval_months} months`}
                  {mode === "scheduled" ? " · based on the standard interval" : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
