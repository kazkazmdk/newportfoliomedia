import type { ReactNode } from "react";

export type CockpitState = "now" | "soon" | "reference";

const STATE_LABELS: Record<CockpitState, string> = {
  now: "Now",
  soon: "Soon",
  reference: "Reference",
};

export function CockpitCell({
  label,
  value,
  state = "reference",
  provenance,
}: {
  label: string;
  value: ReactNode;
  state?: CockpitState;
  provenance: string;
}) {
  return (
    <div className={`as-cockpit-cell is-${state}`}>
      <div className="as-cockpit-meta">
        <p>{label}</p>
        <span className="as-state">{STATE_LABELS[state]}</span>
      </div>
      <strong>{value}</strong>
      <small>{provenance}</small>
    </div>
  );
}
