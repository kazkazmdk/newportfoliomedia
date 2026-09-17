import type { ReactNode } from "react";

export type FixcodeState = "ready" | "caution" | "stop" | "idle";

const STATE_LABELS: Record<FixcodeState, string> = {
  ready: "Ready",
  caution: "Caution",
  stop: "Stop",
  idle: "Awaiting ID",
};

const PROCESS_STEPS = [
  ["01", "Identify", "Brand · appliance · code"],
  ["02", "Narrow", "Reversible checks first"],
  ["03", "Act safely", "DIY boundary stays visible"],
] as const;

export function StateBadge({
  state,
  children,
}: {
  state: FixcodeState;
  children?: ReactNode;
}) {
  return (
    <span className={`fc-state fc-state--${state}`}>
      <span className="fc-state-dot" aria-hidden />
      {children ?? STATE_LABELS[state]}
    </span>
  );
}

export function ProcessRail({ active = 1 }: { active?: 1 | 2 | 3 }) {
  return (
    <ol className="fc-process" aria-label="Diagnostic process">
      {PROCESS_STEPS.map(([number, label, detail], index) => {
        const position = (index + 1) as 1 | 2 | 3;
        const state = position < active ? "done" : position === active ? "active" : "next";
        return (
          <li key={number} className={`fc-process-step is-${state}`} aria-current={state === "active" ? "step" : undefined}>
            <span className="fc-process-number">{number}</span>
            <span>
              <strong>{label}</strong>
              <small>{detail}</small>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function SafetyLegend() {
  return (
    <div className="fc-safety-legend" aria-label="Safety state legend">
      <StateBadge state="ready">Safe check</StateBadge>
      <StateBadge state="caution">Use caution</StateBadge>
      <StateBadge state="stop">Stop / professional</StateBadge>
    </div>
  );
}

export function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <div className="fc-section-label">
      <span className="fc-section-number">{number}</span>
      <p className="fc-kicker">{children}</p>
    </div>
  );
}
