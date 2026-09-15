"use client";

type Item = { id: string; name: string; spec?: string; km_left: number; months_left: number };

export function OwnershipTimeline({ items }: { items: Item[] }) {
  if (!items.length) {
    return <p className="text-sm text-[var(--as-mute)]">No service interval rows on file for this identity.</p>;
  }
  return (
    <div className="as-timeline">
      <p className="text-[11px] uppercase tracking-[0.2em]">Now</p>
      {items.map((item, index) => (
        <div key={item.id} className={`as-tl ${index === 0 ? "is-now" : ""}`}>
          <p className="as-tl-km">{item.km_left.toLocaleString()} km</p>
          <div>
            <p className={index === 0 ? "as-display text-3xl" : ""}>{item.name}</p>
            <p className="mt-1 text-sm text-[var(--as-mute)]">
              {item.spec ?? "Inspect"} · {item.months_left} months
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
